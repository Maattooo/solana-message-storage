"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMessageAccount } from "@/hooks/useMessageAccount";
import {
  Loader2,
  Trash2,
  Edit3,
  PlusCircle,
  RefreshCw,
  Eraser,
} from "lucide-react";
import { WalletButtonClient } from "@/components/WalletButtonClient";

export default function Home() {
  const { connected } = useWallet();
  const {
    accountData,
    isLoading,
    txState,
    createMessage,
    updateMessage,
    deleteMessage,
    refresh,
    isAuthenticated,
    isAuthenticating,
    authError,
    authenticate,
  } = useMessageAccount();

  const [inputMessage, setInputMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [hasPrefilled, setHasPrefilled] = useState(false);

  const handleEdit = () => {
    if (accountData?.message) {
      if (inputMessage === accountData.message) {
        setInputMessage("");
      } else {
        setInputMessage(accountData.message);
        inputRef.current?.focus();
      }
    }
  };

  // Auto-prefill input field with the existing message when loaded (only on initial load)
  useEffect(() => {
    if (isLoading) return;
    if (!hasPrefilled) {
      if (accountData?.message) {
        setInputMessage(accountData.message);
        setHasPrefilled(true);
      } else if (accountData === null && connected && isAuthenticated) {
        setHasPrefilled(true);
      }
    }
  }, [accountData, hasPrefilled, isLoading, connected, isAuthenticated]);

  useEffect(() => {
    if (!connected || !isAuthenticated) {
      setHasPrefilled(false);
      setInputMessage("");
    }
  }, [connected, isAuthenticated]);

  const isTxPending =
    txState.status === "signing" ||
    txState.status === "sending" ||
    txState.status === "confirming";

  const handleAction = async (action: "create" | "update") => {
    if (!inputMessage.trim() || inputMessage.length > 280) return;
    try {
      if (action === "create") {
        await createMessage(inputMessage);
      }
      if (action === "update") {
        await updateMessage(inputMessage);
      }
      setInputMessage("");
    } catch (error) {
      console.error(`Failed to ${action} message:`, error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMessage();
      setInputMessage("");
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const isLimitExceeded = inputMessage.length > 280;
  const isButtonActive = inputMessage.trim().length > 0 && !isTxPending && !isLimitExceeded;
  const isUpdateActive = isButtonActive && inputMessage !== accountData?.message;

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8 max-w-2xl mx-auto w-full font-sans">
      <div className="w-full flex justify-between items-center mb-12">
        <h2 className="text-xl font-bold tracking-tight text-zinc-400 dark:text-zinc-600">SSMS</h2>
        <WalletButtonClient />
      </div>

      <div className="flex flex-col gap-8 w-full">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent">
            Solana Secret Message Storage
          </h1>
          <p className="text-zinc-500">
            Connect your wallet to interact with your message on devnet.
          </p>
        </div>



        {!connected ? (
          <div className="p-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl w-full text-center">
            <p className="text-zinc-500 font-medium">
              Please connect your wallet to continue.
            </p>
          </div>
        ) : !isAuthenticated ? (
          <div className="p-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl w-full text-center flex flex-col items-center gap-4 bg-white dark:bg-zinc-950/20">
            <p className="text-zinc-500 font-medium max-w-sm">
              Please verify ownership of this wallet to interact with SSMS.
            </p>
            {authError && (
              <p className="text-sm text-red-500 font-semibold max-w-md bg-red-50 dark:bg-red-950/20 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900 leading-relaxed">
                {authError}
              </p>
            )}
            <button
              onClick={authenticate}
              disabled={isAuthenticating}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black rounded-xl font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isAuthenticating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Authenticate Wallet"
              )}
            </button>
          </div>
        ) : isLoading && !accountData ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            <p className="text-sm text-zinc-500">Fetching on-chain PDA account</p>
          </div>
        ) : (
          <div className="w-full space-y-6">
            {/* Account Status Card */}
            <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={refresh}
                  disabled={isTxPending || isLoading}
                  className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg transition-colors disabled:opacity-50"
                  title="Reload PDA data"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-zinc-500" : ""}`} />
                </button>
              </div>

              {accountData ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-2">
                      YOUR MESSAGE
                    </h3>
                    <p className="text-2xl font-bold break-words pr-8">
                      {accountData.message}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={handleEdit}
                      disabled={isTxPending}
                      className="text-green-500 hover:text-green-600 p-2.5 rounded-full hover:bg-green-50 dark:hover:bg-green-950/25 transition-colors disabled:opacity-50 flex-shrink-0"
                      title={inputMessage ? "Clear input message" : "Edit current message"}
                    >
                      {inputMessage ? (
                        <Eraser className="w-5 h-5" />
                      ) : (
                        <Edit3 className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isTxPending}
                      className="text-red-500 hover:text-red-600 p-2.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/25 transition-colors disabled:opacity-50 flex-shrink-0"
                      title="Delete PDA Account"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-zinc-500">
                    No message account found for this wallet. Create one below!
                  </p>
                </div>
              )}
            </div>

            {/* Interaction Form */}
            <div className="space-y-2">
              <div className="flex gap-3 w-full items-start">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Enter your secret message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={isTxPending}
                    className={`w-full px-4 py-3 rounded-xl border bg-transparent focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${isLimitExceeded
                      ? "border-red-400 focus:ring-red-400"
                      : "border-zinc-200 dark:border-zinc-900 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                      }`}
                  />
                </div>

                {!accountData ? (
                  <button
                    onClick={() => handleAction("create")}
                    disabled={!isButtonActive}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium border transition-colors h-[46px] transition-all duration-200 ${isButtonActive
                      ? "bg-yellow-400 hover:bg-yellow-300 text-zinc-900 border-yellow-400 cursor-pointer shadow-sm shadow-yellow-400/10 active:scale-[0.98]"
                      : "bg-white text-zinc-400 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-600 dark:border-zinc-800 cursor-not-allowed opacity-50"
                      }`}
                  >
                    {isTxPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <PlusCircle className="w-5 h-5" />
                    )}
                    Create
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction("update")}
                    disabled={!isUpdateActive}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium border transition-colors h-[46px] transition-all duration-200 ${isUpdateActive
                      ? "bg-yellow-400 hover:bg-yellow-300 text-zinc-950 border-yellow-400 cursor-pointer shadow-sm shadow-yellow-400/10 active:scale-[0.98]"
                      : "bg-white text-zinc-400 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-600 dark:border-zinc-800 cursor-not-allowed opacity-50"
                      }`}
                  >
                    {isTxPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Edit3 className="w-5 h-5" />
                    )}
                    Update
                  </button>
                )}
              </div>

              {/* Character Limit Indicator */}
              <div className="flex justify-end px-1">
                <span
                  className={`text-xs font-semibold ${isLimitExceeded
                    ? "text-red-500"
                    : "text-zinc-400 dark:text-zinc-600"
                    }`}
                >
                  {inputMessage.length}/280
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-16 text-xs text-zinc-400 dark:text-zinc-600 font-medium">
        Made by Maattooo.
      </footer>
    </main>
  );
}
