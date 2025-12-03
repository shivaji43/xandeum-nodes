'use client';

import { useState, useEffect } from 'react';
import { ClusterNode, ApiResponse } from '../types/cluster';

const ClusterNodesDashboard: React.FC = () => {
  const [nodes, setNodes] = useState<ClusterNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchNodes = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/pnodes');
      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        setNodes(result.data);
        setError('');
        setLastUpdated(new Date().toLocaleString());
      } else {
        setError(result.error || 'Failed to fetch cluster nodes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg">Loading cluster nodes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-red-600 text-lg">Error: {error}</div>
        <button
          onClick={fetchNodes}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Xandeum Cluster Nodes Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Real-time cluster node information from Xandeum Devnet
              </p>
            </div>
            <button
              onClick={fetchNodes}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastUpdated}
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {nodes.map((node, index) => (
            <div
              key={node.pubkey}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Node #{index + 1}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                  <span className="text-sm text-gray-500">
                    Version {node.version}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="border-b pb-2">
                  <p className="text-sm font-medium text-gray-700">Public Key</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-900 font-mono break-all">
                      {node.pubkey}
                    </p>
                    <button
                      onClick={() => copyToClipboard(node.pubkey)}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Gossip</p>
                    <p className="text-sm text-gray-900 font-mono">{node.gossip}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">RPC</p>
                    <p className="text-sm text-gray-900 font-mono">{node.rpc}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">TPU</p>
                    <p className="text-sm text-gray-900 font-mono">{node.tpu}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">TVU</p>
                    <p className="text-sm text-gray-900 font-mono">{node.tvu}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                      Advanced Details
                    </summary>
                    <div className="mt-2 space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium">PubSub:</span>
                          <p className="font-mono">{node.pubsub}</p>
                        </div>
                        <div>
                          <span className="font-medium">Serve Repair:</span>
                          <p className="font-mono">{node.serveRepair}</p>
                        </div>
                        <div>
                          <span className="font-medium">TPU Vote:</span>
                          <p className="font-mono">{node.tpuVote}</p>
                        </div>
                        <div>
                          <span className="font-medium">TPU Forwards:</span>
                          <p className="font-mono">{node.tpuForwards}</p>
                        </div>
                        <div>
                          <span className="font-medium">TPU QUIC:</span>
                          <p className="font-mono">{node.tpuQuic}</p>
                        </div>
                        <div>
                          <span className="font-medium">TPU Forwards QUIC:</span>
                          <p className="font-mono">{node.tpuForwardsQuic}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div>
                          <span className="font-medium">Feature Set:</span>
                          <p className="font-mono">{node.featureSet}</p>
                        </div>
                        <div>
                          <span className="font-medium">Shred Version:</span>
                          <p className="font-mono">{node.shredVersion}</p>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Cluster Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{nodes.length}</p>
              <p className="text-sm text-gray-600">Total Nodes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {new Set(nodes.map(node => node.version)).size}
              </p>
              <p className="text-sm text-gray-600">Unique Versions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {new Set(nodes.map(node => node.shredVersion)).size}
              </p>
              <p className="text-sm text-gray-600">Shred Versions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {nodes.length > 0 ? nodes[0].featureSet : 0}
              </p>
              <p className="text-sm text-gray-600">Feature Set</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClusterNodesDashboard;
