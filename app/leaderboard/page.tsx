import LeaderboardPageContent from '@/components/LeaderboardPageContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard | Xandeum Explorer',
  description: 'Top performing Xandeum pNodes ranked by uptime and reliability.',
  openGraph: {
    title: 'Leaderboard | Xandeum Explorer',
    description: 'Top performing Xandeum pNodes ranked by uptime and reliability.',
  },
};

export default function LeaderboardPage() {
  return <LeaderboardPageContent />;
}
