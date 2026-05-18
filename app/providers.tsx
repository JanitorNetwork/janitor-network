"use client";

// Wallet providers (Phantom, MetaMask, WalletConnect, etc.) will be
// wired in here at Phase 4 launch. Keep this as the single mount point
// so the rest of the app never needs to change when we add them.
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
