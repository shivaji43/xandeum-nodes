import ClusterNodesDashboard from '../components/ClusterNodesDashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Xandeum Explorer',
  description: 'Real-time dashboard of Xandeum pNodes, visualizing network distribution and status.',
  openGraph: {
    title: 'Dashboard | Xandeum Explorer',
    description: 'Real-time dashboard of Xandeum pNodes, visualizing network distribution and status.',
  },
};

export default function Home() {
  return <ClusterNodesDashboard />;
}
