"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, type Wallet } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { IDL, Pda, getMessagePda } from "../lib/program";

export interface MessageAccountState {
  user: PublicKey;
  message: string;
  bump: number;
}

export function useMessageAccount() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [accountData, setAccountData] = useState<MessageAccountState | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Anchor Provider and Program
  const program = useMemo(() => {
    if (!wallet || !wallet.publicKey) return null;
    const provider = new AnchorProvider(
      connection,
      wallet as unknown as Wallet,
      {
        commitment: "confirmed",
      }
    );
    return new Program<Pda>(IDL as Pda, provider);
  }, [connection, wallet]);

  const pda = useMemo(() => {
    if (!wallet.publicKey) return null;
    const [address] = getMessagePda(wallet.publicKey);
    return address;
  }, [wallet.publicKey]);

  const fetchAccount = useCallback(async () => {
    if (!program || !pda) return;
    try {
      setIsLoading(true);
      const data = await program.account.messageAccount.fetchNullable(
        pda,
        "confirmed"
      );
      setAccountData(data as MessageAccountState | null);
    } catch (err) {
      console.error("Error fetching account:", err);
      setAccountData(null);
    } finally {
      setIsLoading(false);
    }
  }, [program, pda]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAccount();
  }, [fetchAccount]);

  const createMessage = async (message: string) => {
    if (!program) throw new Error("Program not initialized");
    const tx = await program.methods
      .create(message)
      .accounts({})
      .rpc({ commitment: "confirmed" });
    await fetchAccount();
    return tx;
  };

  const updateMessage = async (message: string) => {
    if (!program) throw new Error("Program not initialized");
    const tx = await program.methods
      .update(message)
      .accounts({})
      .rpc({ commitment: "confirmed" });
    await fetchAccount();
    return tx;
  };

  const deleteMessage = async () => {
    if (!program) throw new Error("Program not initialized");
    const tx = await program.methods
      .delete()
      .accounts({})
      .rpc({ commitment: "confirmed" });
    setAccountData(null); // Clear local state after closing
    return tx;
  };

  return {
    accountData,
    isLoading,
    createMessage,
    updateMessage,
    deleteMessage,
    refresh: fetchAccount,
  };
}
