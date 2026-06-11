"use client";

import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function WalletButtonClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-32 h-12 bg-zinc-900 rounded-full animate-pulse" />;
  }

  return (
    <WalletMultiButton className="!bg-zinc-900 hover:!bg-zinc-800 !rounded-full transition-colors" />
  );
}
