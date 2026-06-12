"use client";

import { useEffect, useState, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { type WalletName } from "@solana/wallet-adapter-base";
import { Copy, LogOut, ChevronDown, Check } from "lucide-react";

const BackpackIconSvg = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 rounded-md bg-zinc-950 p-1" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 8C4 5.79086 5.79086 4 8 4H16C18.2091 4 20 5.79086 20 8V18C20 20.2091 18.2091 22 16 22H8C5.79086 22 4 20.2091 4 18V8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 4V7C9 8.65685 10.3431 10 12 10C13.6569 10 15 8.65685 15 7V4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 14H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function WalletButtonClient() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    wallets,
    select,
    wallet,
    publicKey,
    connected,
    disconnect,
    connect,
  } = useWallet();

  useEffect(() => {
    setMounted(true);
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  // Close dropdown on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Automatically connect when a wallet is selected
  useEffect(() => {
    if (wallet && !connected) {
      connect().catch((err) => {
        console.error("Wallet connection failed:", err);
      });
    }
  }, [wallet, connected, connect]);

  if (!mounted) {
    return (
      <div className="w-36 h-11 bg-zinc-900 dark:bg-zinc-800 rounded-xl animate-pulse" />
    );
  }

  const handleCopy = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWalletSelect = (walletName: WalletName) => {
    select(walletName);
    setIsOpen(false);
  };

  // Filter wallets:
  // On Mobile: show compatible wallets (Phantom, Solflare) by default to allow deep linking redirection
  // On Desktop: only show actually detected/installed wallets
  const displayedWallets = wallets.filter((w) => {
    const isDetected = w.readyState === "Installed" || w.readyState === "Loadable";
    if (isMobile) {
      return isDetected || w.adapter.name === "Phantom" || w.adapter.name === "Solflare";
    }
    return isDetected;
  });

  const hasBackpack = displayedWallets.some((w) => w.adapter.name === "Backpack");

  const handleBackpackMobileRedirect = () => {
    const dAppUrl = encodeURIComponent(window.location.href);
    window.location.href = `https://backpack.app/open?uri=${dAppUrl}`;
    setIsOpen(false);
  };

  const shortAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : "";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {!connected ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black rounded-xl font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer text-sm"
        >
          Select Wallet
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-medium hover:bg-zinc-200/50 dark:hover:bg-zinc-900/50 transition-colors shadow-sm cursor-pointer text-sm"
        >
          {wallet?.adapter.icon && (
            <img
              src={wallet.adapter.icon}
              alt={wallet.adapter.name}
              className="w-5 h-5 rounded-md"
            />
          )}
          <span className="font-mono text-zinc-800 dark:text-zinc-200">
            {shortAddress}
          </span>
          <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-64 origin-top-right rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 shadow-xl ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-900 animate-in fade-in slide-in-from-top-2 duration-150">
          {connected && (
            <div className="p-3.5 space-y-2">
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                Connected with {wallet?.adapter.name}
              </div>
              <button
                onClick={handleCopy}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">Copied Address!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  disconnect();
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          )}

          <div className="p-3.5 space-y-2">
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
              {connected ? "Switch Wallet" : "Select Solana Wallet"}
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
              {displayedWallets.length === 0 ? (
                <div className="text-center py-4 px-2 space-y-3">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                    No Solana wallets detected.
                  </p>
                  <a
                    href="https://backpack.app/download"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-900 rounded-xl font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    Install Backpack Wallet
                  </a>
                </div>
              ) : (
                <>
                  {displayedWallets.map((w) => {
                    const isInstalled =
                      w.readyState === "Installed" || w.readyState === "Loadable";
                    const isSelected = wallet?.adapter.name === w.adapter.name;

                    return (
                      <button
                        key={w.adapter.name}
                        onClick={() => handleWalletSelect(w.adapter.name)}
                        className={`flex w-full items-center justify-between px-3 py-2 text-sm rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 font-medium"
                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={w.adapter.icon}
                            alt={w.adapter.name}
                            className="w-5 h-5 rounded-md"
                          />
                          <span className="font-medium">{w.adapter.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isInstalled ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Detected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-50 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 border border-zinc-100 dark:border-zinc-800">
                              Mobile Link
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  {isMobile && !hasBackpack && (
                    <button
                      onClick={handleBackpackMobileRedirect}
                      className="flex w-full items-center justify-between px-3 py-2 text-sm rounded-xl transition-all cursor-pointer text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      <div className="flex items-center gap-2.5">
                        <BackpackIconSvg />
                        <span className="font-medium">Backpack</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-50 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 border border-zinc-100 dark:border-zinc-800">
                          Mobile Link
                        </span>
                      </div>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
