'use client';

import dynamic from 'next/dynamic';
import SwapInterface from '@/components/SwapInterface';
import TokenStats from '@/components/TokenStats';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

export default function TradePageContent() {
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

        {/* Swap Interface & Stake Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex justify-center w-full">
                <SwapInterface />
            </div>

            {/* Stake Card */}
            <div className="bg-card border rounded-xl p-6 shadow-sm w-full max-w-md mx-auto h-full">
                <h2 className="text-2xl font-bold mb-4">Want to Stake?</h2>
                <p className="text-muted-foreground mb-6">
                    Stake your SOL to receive liquid staked XandSOL, earning rewards while maintaining liquidity.
                </p>
                
                <div className="bg-secondary/20 p-4 rounded-lg mb-6 border border-secondary/50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="font-medium text-emerald-500">Live on Mainnet</span>
                    </div>
                </div>

                <a 
                    href="https://xandsol.xandeum.network/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full"
                >
                    <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-7 rounded-md font-medium transition-colors">
                        Go to Staking
                    </button>
                </a>
            </div>
        </div>

        {/* Token Stats */}
        <TokenStats />

      </div>
    </div>
  );
}
