import NetworkPageContent from '@/components/NetworkPageContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Network Stats | Xandeum Explorer',
  description: 'Detailed network statistics for Xandeum, including TPS, block height, and active validators.',
  openGraph: {
    title: 'Network Stats | Xandeum Explorer',
    description: 'Detailed network statistics for Xandeum, including TPS, block height, and active validators.',
  },
};

export default function NetworkPage() {
  return <NetworkPageContent />;
}
