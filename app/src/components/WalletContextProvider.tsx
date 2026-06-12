"use client";

import { useMemo, useEffect, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

// Import standard wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

export default function WalletContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [autoConnect, setAutoConnect] = useState(false);

  // Resolve RPC endpoint: custom URL > env-based cluster > devnet fallback
  const endpoint = useMemo(() => {
    if (process.env.NEXT_PUBLIC_RPC_URL) {
      return process.env.NEXT_PUBLIC_RPC_URL;
    }
    const network =
      (process.env.NEXT_PUBLIC_SOLANA_NETWORK as
        | "devnet"
        | "testnet"
        | "mainnet-beta") || "devnet";
    return clusterApiUrl(network);
  }, []);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) {
      // On desktop, auto-connect on refresh is safe and standard
      setAutoConnect(true);
    } else {
      // On mobile, only auto-connect if we are inside a wallet's in-app browser 
      const win = window as unknown as Record<string, unknown>;
      const isWalletInjected =
        typeof window !== "undefined" &&
        (!!win["solana"] ||
          !!win["backpack"] ||
          !!win["solflare"] ||
          !!win["phantom"]);
      setAutoConnect(isWalletInjected);
    }
  }, []);

  return (
    <ConnectionProvider
      endpoint={endpoint}
      config={{ commitment: "confirmed" }}
    >
      <WalletProvider wallets={wallets} autoConnect={autoConnect}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
