"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMessageAccount } from "@/hooks/useMessageAccount";
import { Loader2, Trash2, Edit3, PlusCircle } from "lucide-react";
import { WalletButtonClient } from "@/components/WalletButtonClient";

export default function Home() {
  const { connected } = useWallet();
  const {
    accountData,
    isLoading,
    createMessage,
    updateMessage,
    deleteMessage,
  } = useMessageAccount();

  const [inputMessage, setInputMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (action: "create" | "update") => {
    if (!inputMessage.trim()) return;
    try {
      setIsSubmitting(true);
      if (action === "create") await createMessage(inputMessage);
      if (action === "update") await updateMessage(inputMessage);
      setInputMessage("");
    } catch (error) {
      console.error(`Failed to ${action} message:`, error);
      alert(`Transaction failed. See console for details.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await deleteMessage();
    } catch (error) {
      console.error("Failed to delete message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8 max-w-2xl mx-auto w-full font-sans">
      <div className="w-full flex justify-end mb-12">
        <WalletButtonClient />
      </div>

      <div className="flex flex-col items-center gap-8 w-full">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Solana Secret Message Storage
          </h1>
          <p className="text-zinc-500">
            Connect your wallet to interact with your personal program-derived
            address.
          </p>
        </div>

        {!connected ? (
          <div className="p-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl w-full text-center">
            <p className="text-zinc-500 font-medium">
              Please connect your wallet to continue.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="w-full space-y-6">
            {/* Account Status Card */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              {accountData ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-1">
                      Your Message
                    </h3>
                    <p className="text-2xl font-semibold break-words">
                      {accountData.message}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs text-zinc-500">
                      Bump: {accountData.bump}
                    </span>
                    <button
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                      title="Delete Account"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-zinc-500">
                    No message account found for this wallet. Create One!
                  </p>
                </div>
              )}
            </div>

            {/* Interaction Form */}
            <div className="flex gap-3 w-full">
              <input
                type="text"
                placeholder="Enter your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all disabled:opacity-50"
              />

              {!accountData ? (
                <button
                  onClick={() => handleAction("create")}
                  disabled={!inputMessage.trim() || isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <PlusCircle className="w-5 h-5" />
                  )}
                  Create
                </button>
              ) : (
                <button
                  onClick={() => handleAction("update")}
                  disabled={!inputMessage.trim() || isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Edit3 className="w-5 h-5" />
                  )}
                  Update
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
