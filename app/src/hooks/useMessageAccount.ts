"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, type Wallet } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { IDL, Pda, getMessagePda } from "../lib/program";

export interface MessageAccountState {
  user: PublicKey;
  message: string;
  bump: number;
}

export type TxStatus = "idle" | "signing" | "sending" | "confirming" | "success" | "error";

export interface TxState {
  status: TxStatus;
  signature?: string;
  error?: string;
}

const parseTransactionError = (error: unknown): string => {
  const errMsg = error instanceof Error ? error.message : String(error);
  
  const errCode = typeof error === "object" && error !== null && "code" in error
    ? (error as { code?: number }).code
    : undefined;

  if (
    errMsg.includes("User rejected") || 
    errMsg.includes("Rejected") || 
    errMsg.includes("user did not approve") || 
    errCode === 4001
  ) {
    return "Transaction rejected by user in wallet.";
  }
  
  if (
    errMsg.includes("insufficient funds") || 
    errMsg.includes("insufficient lamports") || 
    errMsg.includes("Attempt to debit an account but allowed to debit only")
  ) {
    return "Insufficient SOL balance to cover transaction fees and rent.";
  }

  if (errMsg.includes("MessageTooLong") || errMsg.includes("6000") || errMsg.includes("0x1770")) {
    return "Message too long! Maximum message length is 280 characters.";
  }
  
  if (errMsg.includes("timed out") || errMsg.includes("Timeout")) {
    return "Transaction confirmation timed out. The transaction might still succeed on-chain. Check the explorer.";
  }

  return errMsg;
};

export function useMessageAccount() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions, connected, signMessage } =
    useWallet();

  const [accountData, setAccountData] = useState<MessageAccountState | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [txState, setTxState] = useState<TxState>({ status: "idle" });

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Track the current fetch so we can cancel stale ones
  const fetchIdRef = useRef(0);

  // Derive PDA from the connected wallet's public key
  const pda = useMemo(() => {
    if (!publicKey) return null;
    const [address] = getMessagePda(publicKey);
    return address;
  }, [publicKey]);

  // Build a stable read-only Anchor Program instance that only depends on connection
  const readOnlyProgram = useMemo(() => {
    const provider = new AnchorProvider(
      connection,
      {} as Wallet,
      { commitment: "confirmed" }
    );
    return new Program<Pda>(IDL as Pda, provider);
  }, [connection]);

  // Build the Anchor Program instance only when the wallet is fully ready
  const program = useMemo(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) return null;
    const provider = new AnchorProvider(
      connection,
      { publicKey, signTransaction, signAllTransactions } as Wallet,
      { commitment: "confirmed" }
    );
    return new Program<Pda>(IDL as Pda, provider);
  }, [connection, publicKey, signTransaction, signAllTransactions]);

  // Handle cryptographic message signing authentication
  const handleAuthenticate = useCallback(async () => {
    if (!publicKey || !signMessage) {
      setAuthError("Wallet extension does not support message signing or is not ready.");
      return;
    }
    try {
      setIsAuthenticating(true);
      setAuthError(null);
      const messageText = `Sign this message to authenticate your wallet connection with Solana Secret Message Storage (SSMS).`;
      const messageBytes = new TextEncoder().encode(messageText);
      const signature = await signMessage(messageBytes);
      
      const { ed25519 } = await import("@noble/curves/ed25519");
      const isValid = ed25519.verify(signature, messageBytes, publicKey.toBytes());
      
      if (!isValid) {
        throw new Error("Signature verification failed.");
      }
      
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Authentication failed:", err);
      if (err instanceof Error && (err.message.includes("User rejected") || err.message.includes("Rejected") || err.message.includes("4001"))) {
        setAuthError("Authentication signature rejected by user.");
      } else {
        setAuthError(err instanceof Error ? err.message : String(err));
      }
      setIsAuthenticated(false);
    } finally {
      setIsAuthenticating(false);
    }
  }, [publicKey, signMessage]);

  // Fetch the on-chain account data, with stale-request cancellation
  const fetchAccount = useCallback(async () => {
    if (!readOnlyProgram || !pda) return;

    const id = ++fetchIdRef.current;
    try {
      setIsLoading(true);
      const data = await readOnlyProgram.account.messageAccount.fetchNullable(
        pda,
        "confirmed"
      );
      // Only update state if this is still the latest fetch
      if (id === fetchIdRef.current) {
        setAccountData(data as MessageAccountState | null);
      }
    } catch (err) {
      console.error("Error fetching account:", err);
      if (id === fetchIdRef.current) {
        setAccountData(null);
      }
    } finally {
      if (id === fetchIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [readOnlyProgram, pda]);

  // Auto-fetch when wallet connects and is authenticated; clear data when it disconnects
  useEffect(() => {
    if (connected && pda && isAuthenticated) {
      fetchAccount();
    }
    if (!connected) {
      setAccountData(null);
      setIsLoading(false);
      setTxState({ status: "idle" });
      setIsAuthenticated(false);
      setAuthError(null);
    }
  }, [connected, pda, isAuthenticated, fetchAccount]);

  // Auto-trigger authentication request on connection
  useEffect(() => {
    if (connected && publicKey && signMessage && !isAuthenticated && !isAuthenticating && !authError) {
      handleAuthenticate();
    }
  }, [connected, publicKey, signMessage, isAuthenticated, isAuthenticating, authError, handleAuthenticate]);

  // Check if wallet balance is >= 0.005 SOL
  const checkBalance = useCallback(async () => {
    if (!publicKey) return false;
    try {
      const balance = await connection.getBalance(publicKey);
      return balance >= 5_000_000; // 0.005 SOL
    } catch (err) {
      console.error("Failed to check wallet balance:", err);
      return false;
    }
  }, [connection, publicKey]);

  const resetTxState = useCallback(() => {
    setTxState({ status: "idle" });
  }, []);

  const createMessage = useCallback(
    async (message: string) => {
      if (!program || !publicKey || !signTransaction) {
        throw new Error("Wallet not connected or program not ready");
      }
      let signature: string | undefined = undefined;
      try {
        setTxState({ status: "signing" });

        const [hasBalance, latestBlockhash] = await Promise.all([
          checkBalance(),
          connection.getLatestBlockhash("confirmed")
        ]);

        if (!hasBalance) {
          throw new Error("Insufficient SOL balance. You need at least 0.005 SOL to cover transaction fees and rent.");
        }

        const tx = await program.methods.create(message).accounts({}).transaction();
        tx.feePayer = publicKey;
        tx.recentBlockhash = latestBlockhash.blockhash;

        const signedTx = await signTransaction(tx);
        
        setTxState({ status: "sending" });
        signature = await connection.sendRawTransaction(signedTx.serialize());
        
        setTxState({ status: "confirming", signature });
        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          "confirmed"
        );

        if (confirmation.value.err) {
          throw new Error(`Transaction confirmation failed: ${JSON.stringify(confirmation.value.err)}`);
        }

        setTxState({ status: "success", signature });
        await fetchAccount();
        return signature;
      } catch (err) {
        console.error("Create message failed:", err);
        setTxState({
          status: "error",
          signature,
          error: parseTransactionError(err),
        });
        throw err;
      }
    },
    [program, publicKey, signTransaction, connection, checkBalance, fetchAccount]
  );

  const updateMessage = useCallback(
    async (message: string) => {
      if (!program || !publicKey || !signTransaction) {
        throw new Error("Wallet not connected or program not ready");
      }
      let signature: string | undefined = undefined;
      try {
        setTxState({ status: "signing" });

        const [hasBalance, latestBlockhash] = await Promise.all([
          checkBalance(),
          connection.getLatestBlockhash("confirmed")
        ]);

        if (!hasBalance) {
          throw new Error("Insufficient SOL balance. You need at least 0.005 SOL to cover transaction fees and rent.");
        }

        const tx = await program.methods.update(message).accounts({}).transaction();
        tx.feePayer = publicKey;
        tx.recentBlockhash = latestBlockhash.blockhash;

        const signedTx = await signTransaction(tx);
        
        setTxState({ status: "sending" });
        signature = await connection.sendRawTransaction(signedTx.serialize());
        
        setTxState({ status: "confirming", signature });
        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          "confirmed"
        );

        if (confirmation.value.err) {
          throw new Error(`Transaction confirmation failed: ${JSON.stringify(confirmation.value.err)}`);
        }

        setTxState({ status: "success", signature });
        await fetchAccount();
        return signature;
      } catch (err) {
        console.error("Update message failed:", err);
        setTxState({
          status: "error",
          signature,
          error: parseTransactionError(err),
        });
        throw err;
      }
    },
    [program, publicKey, signTransaction, connection, checkBalance, fetchAccount]
  );

  const deleteMessage = useCallback(async () => {
    if (!program || !publicKey || !signTransaction) {
      throw new Error("Wallet not connected or program not ready");
    }
    let signature: string | undefined = undefined;
    try {
      setTxState({ status: "signing" });

      const [hasBalance, latestBlockhash] = await Promise.all([
        checkBalance(),
        connection.getLatestBlockhash("confirmed")
      ]);

      if (!hasBalance) {
        throw new Error("Insufficient SOL balance. You need at least 0.005 SOL to cover transaction fees.");
      }

      const tx = await program.methods.delete().accounts({}).transaction();
      tx.feePayer = publicKey;
      tx.recentBlockhash = latestBlockhash.blockhash;

      const signedTx = await signTransaction(tx);
      
      setTxState({ status: "sending" });
      signature = await connection.sendRawTransaction(signedTx.serialize());
      
      setTxState({ status: "confirming", signature });
      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "confirmed"
      );

      if (confirmation.value.err) {
        throw new Error(`Transaction confirmation failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      setTxState({ status: "success", signature });
      setAccountData(null);
      return signature;
    } catch (err) {
      console.error("Delete message failed:", err);
      setTxState({
        status: "error",
        signature,
        error: parseTransactionError(err),
      });
      throw err;
    }
  }, [program, publicKey, signTransaction, connection, checkBalance]);

  return {
    accountData,
    isLoading,
    txState,
    resetTxState,
    createMessage,
    updateMessage,
    deleteMessage,
    refresh: fetchAccount,
    isAuthenticated,
    isAuthenticating,
    authError,
    authenticate: handleAuthenticate,
  };
}
