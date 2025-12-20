'use client';

import dynamic from 'next/dynamic';
import SwapInterface from '@/components/SwapInterface';
import TokenStats from '@/components/TokenStats';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

export default function TradePage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-8 font-sans flex flex-col items-center">
      
      <div className="w-full max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Trade XAND</h1>
            <p className="text-muted-foreground mt-1">
              Swap tokens for XAND using Jupiter Aggregator.
            </p>
          </div>
          <div>
            <WalletMultiButton />
          </div>
        </div>

        {/* Swap Interface */}
        <div className="flex justify-center w-full mt-8">
            <SwapInterface />
        </div>

        {/* Token Stats */}
        <TokenStats />

      </div>
    </div>
  );
}
