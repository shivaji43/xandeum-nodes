'use client';

import { useState, useEffect } from 'react';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('xandeum-watchlist');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse watchlist:', e);
      }
    }
  }, []);

  const toggleWatchlist = (pubkey: string) => {
    setWatchlist(prev => {
      const newWatchlist = prev.includes(pubkey)
        ? prev.filter(k => k !== pubkey)
        : [...prev, pubkey];
      
      localStorage.setItem('xandeum-watchlist', JSON.stringify(newWatchlist));
      return newWatchlist;
    });
  };

  const isInWatchlist = (pubkey: string) => watchlist.includes(pubkey);

  return { watchlist, toggleWatchlist, isInWatchlist };
}
