'use client';

import { useState, useEffect } from 'react';

export interface LeaderboardEntry {
  pod_id: string;
  credits: number;
}

export function useLeaderboardData() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        const result = await response.json();
        
        // Sort by credits descending
        const sortedData = (result.pods_credits || []).sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.credits - a.credits);
        
        setData(sortedData);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}
