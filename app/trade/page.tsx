import TradePageContent from '@/components/TradePageContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trade | Xandeum Explorer',
  description: 'Trade Xandeum tokens and manage your portfolio.',
  openGraph: {
    title: 'Trade | Xandeum Explorer',
    description: 'Trade Xandeum tokens and manage your portfolio.',
  },
};

export default function TradePage() {
  return <TradePageContent />;
}
