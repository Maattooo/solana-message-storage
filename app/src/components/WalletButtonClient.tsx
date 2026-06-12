"use client";

import { useEffect, useState, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { type WalletName } from "@solana/wallet-adapter-base";
import { Copy, LogOut, ChevronDown, Check } from "lucide-react";

const SOLFLARE_ICON = "https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/solflare/assets/solflare.svg";
const METAMASK_ICON = "https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/Metamask-logo.svg";
const BACKPACK_ICON = "https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/backpack/assets/backpack.svg";

export function WalletButtonClient() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isUserSelectingRef = useRef(false);

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

  // Automatically connect when a wallet is selected by the user
  useEffect(() => {
    if (wallet && !connected && isUserSelectingRef.current) {
      isUserSelectingRef.current = false;
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
    isUserSelectingRef.current = true;
    select(walletName);
    setIsOpen(false);
  };

  // Filter wallets:
  // On Mobile: only show standard injected wallets
  // On Desktop: show actually installed or loadable wallets
  const displayedWallets = wallets.filter((w) => {
    const isInstalled = w.readyState === "Installed";
    const isLoadable = w.readyState === "Loadable";
    if (isMobile) {
      return isInstalled && w.adapter.name !== "Mobile Wallet Adapter" && w.adapter.name !== "Phantom";
    }
    return isInstalled || isLoadable;
  });

  const handleSolflareMobileRedirect = () => {
    const dAppUrl = encodeURIComponent(window.location.href);
    const hasApp = window.confirm(
      "Do you have the Solflare Wallet app installed on your phone?\n\n- Click OK if you have Solflare installed (this will open the dApp inside Solflare).\n- Click Cancel to download Solflare from the App Store."
    );
    if (hasApp) {
      window.location.href = `https://solflare.com/ul/v1/browse/?url=${dAppUrl}&ref=${dAppUrl}`;
    } else {
      window.location.href = "https://solflare.com/download";
    }
    setIsOpen(false);
  };

  const handleMetaMaskMobileRedirect = () => {
    const rawUrl = window.location.href;
    const dAppUrlWithoutProtocol = rawUrl.replace(/^https?:\/\//, "");
    const hasApp = window.confirm(
      "Do you have the MetaMask Wallet app installed on your phone?\n\n- Click OK if you have MetaMask installed (this will open the dApp inside MetaMask).\n- Click Cancel to download MetaMask from the App Store."
    );
    if (hasApp) {
      window.location.href = `https://metamask.app.link/dapp/${dAppUrlWithoutProtocol}`;
    } else {
      window.location.href = "https://metamask.io/download/";
    }
    setIsOpen(false);
  };

  const handleBackpackMobileRedirect = () => {
    const dAppUrl = encodeURIComponent(window.location.href);
    const hasApp = window.confirm(
      "Do you have the Backpack Wallet app installed on your phone?\n\n- Click OK if you have Backpack installed (this will open the dApp inside Backpack).\n- Click Cancel to download Backpack from the App Store."
    );
    if (hasApp) {
      window.location.href = `https://backpack.app/ul/browse/?url=${dAppUrl}&ref=${dAppUrl}`;
    } else {
      window.location.href = "https://backpack.app/download";
    }
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
              {isMobile ? (
                displayedWallets.length === 0 ? (
                  <div className="space-y-1">
                    <button
                      onClick={handleSolflareMobileRedirect}
                      className="flex w-full items-center justify-between px-3 py-2 text-sm rounded-xl transition-all cursor-pointer text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={SOLFLARE_ICON}
                          alt="Solflare"
                          className="w-5 h-5 rounded-md object-contain bg-zinc-950 p-1"
                        />
                        <span className="font-medium">Solflare</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                        Recommended
                      </span>
                    </button>

                    <button
                      onClick={handleMetaMaskMobileRedirect}
                      className="flex w-full items-center justify-between px-3 py-2 text-sm rounded-xl transition-all cursor-pointer text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={METAMASK_ICON}
                          alt="MetaMask"
                          className="w-5 h-5 rounded-md object-contain bg-zinc-950 p-1"
                        />
                        <span className="font-medium">MetaMask</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                        Recommended
                      </span>
                    </button>

                    <button
                      onClick={handleBackpackMobileRedirect}
                      className="flex w-full items-center justify-between px-3 py-2 text-sm rounded-xl transition-all cursor-pointer text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={BACKPACK_ICON}
                          alt="Backpack"
                          className="w-5 h-5 rounded-md object-contain bg-zinc-950 p-1"
                        />
                        <span className="font-medium">Backpack</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                        Recommended
                      </span>
                    </button>
                  </div>
                ) : (
                  <>
                    {displayedWallets.map((w) => {
                      const isSelected = wallet?.adapter.name === w.adapter.name;
                      return (
                        <button
                          key={w.adapter.name}
                          onClick={() => handleWalletSelect(w.adapter.name)}
                          className={`flex w-full items-center justify-between px-3 py-2 text-sm rounded-xl transition-all cursor-pointer ${isSelected
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
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Detected
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )
              ) : (
                displayedWallets.length === 0 ? (
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
                      const isInstalled = w.readyState === "Installed";
                      const isLoadable = w.readyState === "Loadable";
                      const isSelected = wallet?.adapter.name === w.adapter.name;

                      return (
                        <button
                          key={w.adapter.name}
                          onClick={() => handleWalletSelect(w.adapter.name)}
                          className={`flex w-full items-center justify-between px-3 py-2 text-sm rounded-xl transition-all cursor-pointer ${isSelected
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
                            ) : isLoadable ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                                Recommended
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
                  </>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
