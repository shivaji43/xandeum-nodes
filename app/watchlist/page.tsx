import ClusterNodesDashboard from '@/components/ClusterNodesDashboard';

export default function WatchlistPage() {
  return <ClusterNodesDashboard onlyWatchlist={true} hideMap={true} hideStats={true} />;
}
