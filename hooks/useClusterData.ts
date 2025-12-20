'use client';

import { useState, useEffect } from 'react';
import { ClusterNode, ApiResponse } from '../types/cluster';

export function useClusterData() {
  const [nodes, setNodes] = useState<ClusterNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [dataSource, setDataSource] = useState<string>('');
  const [mapPoints, setMapPoints] = useState<{ lat: number; lon: number; label?: string; node?: ClusterNode; country?: string; city?: string }[]>([]);

  const fetchNodes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pnodes');
      const result: ApiResponse = await response.json();
      
      const podsData = result.result?.pods || result.result?.value?.pods;

      if (podsData) {
        const mappedNodes = podsData.map((pod: any) => ({
          ...pod,
          // Map RPC fields to UI fields
          gossip: pod.address,
          storageCommitted: pod.storage_committed,
          storageUsagePercent: pod.storage_usage_percent,
          storageUsed: pod.storage_used,
          rpcPort: pod.rpc_port,
          isPublic: pod.is_public,
          lastSeenTimestamp: pod.last_seen_timestamp,
          isPNode: true, // All nodes from this RPC are pNodes (pods)
          shredVersion: 0 // Not provided in new RPC
        }));

        // Deduplicate nodes by pubkey
        const uniqueNodes = Array.from(new Map(mappedNodes.map((node: any) => [node.pubkey, node])).values());
        
        setNodes(uniqueNodes as ClusterNode[]);
        
        setError('');
        setLastUpdated(new Date().toLocaleTimeString());
        setDataSource('pRPC via 216.234.134.5');
      } else if (result.error) {
        setError(result.error);
      } else {
        setError('Failed to fetch cluster nodes: Invalid response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
    const intervalId = setInterval(fetchNodes, 30000); // 30s auto-refresh
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (nodes.length > 0) {
      const fetchGeoLocations = async () => {
        // Extract unique IPs from gossip addresses
        const uniqueIps = Array.from(new Set(
          nodes
            .map(n => n.address?.split(':')[0])
            .filter((ip): ip is string => !!ip && ip !== '127.0.0.1' && ip !== '0.0.0.0')
        ));

        if (uniqueIps.length === 0) return;

        // Batch request to ip-api.com (supports up to 100 per batch)
        try {
          const allPoints: { lat: number; lon: number; label?: string; node?: ClusterNode; country?: string; city?: string }[] = [];

          // Send all IPs to our proxy - it handles batching and caching
          const response = await fetch('/api/geo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(uniqueIps),
          });

          if (response.ok) {
            const data = await response.json();
            const points = data
              .map((item: any) => {
                // Find the first node associated with this IP
                const associatedNode = nodes.find(n => n.address?.startsWith(item.query));
                return {
                  lat: item.lat,
                  lon: item.lon,
                  label: item.query,
                  node: associatedNode,
                  country: item.country,
                  city: item.city
                };
              });
            allPoints.push(...points);
          }
          
          setMapPoints(allPoints);
        } catch (error) {
          console.error("Failed to fetch geolocations:", error);
        }
      };

      fetchGeoLocations();
    }
  }, [nodes]);

  return {
    nodes,
    loading,
    error,
    lastUpdated,
    dataSource,
    mapPoints,
    refresh: fetchNodes
  };
}
