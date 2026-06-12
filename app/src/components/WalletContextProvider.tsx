"use client";

import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

// Import standard wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

export default function WalletContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
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
    () => [new PhantomWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider
      endpoint={endpoint}
      config={{ commitment: "confirmed" }}
    >
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
