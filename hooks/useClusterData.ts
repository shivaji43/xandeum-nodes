'use client';

import { useState, useEffect } from 'react';
import { ClusterNode, ApiResponse } from '../types/cluster';

import { useNetwork } from '@/components/NetworkContext';

export function useClusterData() {
  const { network } = useNetwork();
  const [nodes, setNodes] = useState<ClusterNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [dataSource, setDataSource] = useState<string>('');
  const [mapPoints, setMapPoints] = useState<{ lat: number; lon: number; label?: string; nodes?: ClusterNode[]; country?: string; city?: string }[]>([]);

  const fetchNodes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pnodes?network=${network}`);
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
          shredVersion: 0, // Not provided in new RPC
          status: (Date.now() / 1000) - pod.last_seen_timestamp < 300 ? 'Online' : 'Offline'
        }));

        // Show all nodes including duplicates as requested
        setNodes(mappedNodes as ClusterNode[]);
        
        setError('');
        setLastUpdated(new Date().toLocaleTimeString());
        setDataSource(network === 'mainnet' ? 'Mainnet (216.234.134.4)' : 'Devnet (173.212.207.32)');
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
  }, [network]);

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
          const allPoints: { lat: number; lon: number; label?: string; nodes?: ClusterNode[]; country?: string; city?: string }[] = [];

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
            
            // Map to store combined points by "lat,lon" key
            const pointsMap = new Map<string, { lat: number; lon: number; label: string; nodes: ClusterNode[]; country?: string; city?: string }>();

            data.forEach((item: any) => {
              // Find all nodes associated with this IP
              const associatedNodes = nodes.filter(n => n.address?.startsWith(item.query));
              
              const key = `${item.lat},${item.lon}`;
              
              if (pointsMap.has(key)) {
                // If point exists, append nodes
                const existingPoint = pointsMap.get(key)!;
                if (associatedNodes.length > 0) {
                   existingPoint.nodes.push(...associatedNodes);
                   // Optionally update label or other metadata if needed, 
                   // but usually location info (country/city) is same for same lat/lon
                }
              } else {
                // Create new point
                 pointsMap.set(key, {
                  lat: item.lat,
                  lon: item.lon,
                  label: item.query, // This might be just one IP, but that's okay for label
                  nodes: [...associatedNodes], // Create a new array
                  country: item.country,
                  city: item.city
                });
              }
            });
            
            allPoints.push(...Array.from(pointsMap.values()));
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
    network, // Still returning network for convenience
    mapPoints,
    refresh: fetchNodes
  };
}
