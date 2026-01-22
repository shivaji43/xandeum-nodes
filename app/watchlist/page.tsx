import ClusterNodesDashboard from '@/components/ClusterNodesDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Watchlist | Xandeum Explorer',
  description: 'Track your favorite Xandeum pNodes and tokens in one place.',
  openGraph: {
    title: 'Watchlist | Xandeum Explorer',
    description: 'Track your favorite Xandeum pNodes and tokens in one place.',
  },
};

export default function WatchlistPage() {
  return <ClusterNodesDashboard onlyWatchlist={true} hideMap={true} hideStats={true} />;
}
