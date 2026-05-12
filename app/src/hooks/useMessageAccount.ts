"use client";

import { useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { IDL, Pda, PROGRAM_ID, getMessagePda } from "../lib/program";

export function useMessageAccount() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [accountData, setAccountData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Anchor Provider and Program
  const program = useMemo(() => {
    if (!wallet || !wallet.publicKey) return null;
    const provider = new AnchorProvider(connection, wallet as any, {
      commitment: "confirmed",
    });
    return new Program<Pda>(IDL as Pda, provider);
  }, [connection, wallet]);

  const pda = useMemo(() => {
    if (!wallet.publicKey) return null;
    const [address] = getMessagePda(wallet.publicKey);
    return address;
  }, [wallet.publicKey]);

  const fetchAccount = async () => {
    if (!program || !pda) return;
    try {
      setIsLoading(true);
      const data = await program.account.messageAccount.fetchNullable(
        pda,
        "confirmed",
      );
      setAccountData(data);
    } catch (err) {
      console.error("Error fetching account:", err);
      setAccountData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, [program, pda]);

  const createMessage = async (message: string) => {
    if (!program) throw new Error("Program not initialized");
    const tx = await program.methods
      .create(message)
      .accounts({}) // Anchor v0.29+ auto-resolves PDA seeds from IDL
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
