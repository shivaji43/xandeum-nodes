'use client';

import Leaderboard from '@/components/Leaderboard';
import { ModeToggle } from '@/components/mode-toggle';
import Image from 'next/image';

export default function LeaderboardPageContent() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image src="/xandeum.png" alt="Xandeum Logo" width={80} height={80} className="h-20 w-20" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Xandeum Network</h1>
              <p className="text-muted-foreground mt-1">
                Pod Credits Leaderboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>

        <Leaderboard />
      </div>
    </div>
  );
}
