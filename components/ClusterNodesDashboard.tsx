'use client';

import { useState, useEffect, useMemo } from 'react';
import { ClusterNode, ApiResponse } from '../types/cluster';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  RefreshCw, 
  Server, 
  Activity, 
  Globe, 
  Copy, 
  Check, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ModeToggle } from './mode-toggle';

import WorldMap from './WorldMap';



export default function ClusterNodesDashboard() {
  const [nodes, setNodes] = useState<ClusterNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [dataSource, setDataSource] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [versionFilter, setVersionFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ClusterNode; direction: 'asc' | 'desc' } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [mapPoints, setMapPoints] = useState<{ lat: number; lon: number; label?: string; node?: ClusterNode }[]>([]);
  const [selectedNode, setSelectedNode] = useState<ClusterNode | null>(null);
  const [publicFilter, setPublicFilter] = useState<string>('all');



  const fetchNodes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pnodes');
      const result: ApiResponse = await response.json();
      
      // The API returns { result: { pods: [...], total_count: ... } }
      // But our proxy might be returning just the inner part or the full RPC.
      // Based on user input:
      // { "result": { "pods": [...], "total_count": 226 } }
      // Wait, the user pasted:
      // { "result": { "pods": [...], "total_count": 226 } }
      // So it is result.pods directly if the proxy returns the body of the RPC response.
      
      // Let's handle both potential structures to be safe, or just the one the user showed.
      // The user showed:
      // { "result": { "pods": [...] } }
      
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
        const batchSize = 100;
        const batches = [];
        for (let i = 0; i < uniqueIps.length; i += batchSize) {
          batches.push(uniqueIps.slice(i, i + batchSize));
        }

        try {
          const allPoints: { lat: number; lon: number; label?: string; node?: ClusterNode }[] = [];

          for (const batch of batches) {
            const response = await fetch('http://ip-api.com/batch', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(batch.map(ip => ({ query: ip, fields: "lat,lon,query" }))),
            });

            if (response.ok) {
              const data = await response.json();
              const points = data
                .filter((item: any) => item.lat && item.lon)
                .map((item: any) => {
                  // Find the first node associated with this IP
                  const associatedNode = nodes.find(n => n.address?.startsWith(item.query));
                  return {
                    lat: item.lat,
                    lon: item.lon,
                    label: item.query,
                    node: associatedNode
                  };
                });
              allPoints.push(...points);
            }
            // Add a small delay between batches to be nice to the API
            await new Promise(resolve => setTimeout(resolve, 500)); 
          }
          
          setMapPoints(allPoints);
        } catch (error) {
          console.error("Failed to fetch geolocations:", error);
        }
      };

      fetchGeoLocations();
    }
  }, [nodes]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSort = (key: keyof ClusterNode) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesSearch = 
        (node.pubkey?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        node.version?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesVersion = versionFilter === 'all' || node.version === versionFilter;
      const matchesPublic = publicFilter === 'all' || (publicFilter === 'public' ? node.is_public : !node.is_public);

      return matchesSearch && matchesVersion && matchesPublic;
    });
  }, [nodes, searchQuery, versionFilter, publicFilter]);

  const sortedNodes = useMemo(() => {
    if (!sortConfig) return filteredNodes;
    
    const { key, direction } = sortConfig;

    return [...filteredNodes].sort((a, b) => {
      const aValue = a[key] ?? '';
      const bValue = b[key] ?? '';

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredNodes, sortConfig]);

  const paginatedNodes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedNodes.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedNodes, currentPage]);

  const totalPages = Math.ceil(sortedNodes.length / itemsPerPage);

  const uniqueVersions = useMemo(() => {
    return Array.from(new Set(nodes.map(n => n.version).filter((v): v is string => !!v))).sort();
  }, [nodes]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading && nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading Cluster Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Activity className="w-5 h-5" /> Connection Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchNodes} variant="outline" className="w-full">
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src="/xandeum.png" alt="Xandeum Logo" className="h-20 w-20" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Xandeum Network</h1>
              <p className="text-muted-foreground mt-1">
                Live Cluster Analytics • Source: {dataSource} • Updated {lastUpdated} • Auto-refresh: 30s
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button onClick={fetchNodes} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* World Map */}
        <WorldMap 
          points={mapPoints} 
          onPointClick={(point) => {
            if (point.node) {
              setSelectedNode(point.node);
            }
          }}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nodes.length}</div>
              <p className="text-xs text-muted-foreground">Active in gossip</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Versions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueVersions.length}</div>
              <p className="text-xs text-muted-foreground">Distinct versions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shred Versions</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(nodes.map(n => n.shredVersion)).size}
              </div>
              <p className="text-xs text-muted-foreground">Network partitions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Health</CardTitle>
              <Activity className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">Online</div>
              {/* <p className="text-xs text-muted-foreground">Devnet is active</p> */}
            </CardContent>
          </Card>

        </div>

        {/* Filters & Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border">
            <div className="flex flex-1 w-full md:max-w-sm items-center space-x-2">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Pubkey or Version..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <Select value={publicFilter} onValueChange={setPublicFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Visibility</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>

              <Select value={versionFilter} onValueChange={setVersionFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Versions</SelectItem>
                  <SelectItem value="all_versions">All Versions</SelectItem>
                  {uniqueVersions.map(v => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead className="w-[200px]">
                  <Button variant="ghost" onClick={() => handleSort('pubkey')} className="hover:bg-transparent pl-0 font-bold">
                    Public Key <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('version')} className="hover:bg-transparent pl-0 font-bold">
                    Version <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Gossip</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('storageUsed')} className="hover:bg-transparent pl-0 font-bold">
                    Storage <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead className="text-right">Last Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedNodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No nodes found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedNodes.map((node, index) => (
                  <TableRow 
                    key={node.pubkey} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedNode(node)}
                  >
                    <TableCell className="font-medium text-muted-foreground">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs truncate max-w-[120px]" title={node.pubkey}>
                          {(node.pubkey || 'Unknown').slice(0, 8)}...{(node.pubkey || '').slice(-8)}
                        </span>
                        {node.isPNode && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 border-emerald-500 text-emerald-500">
                            pNode
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(node.pubkey || '')}
                        >
                          {copiedKey === node.pubkey ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {node.version || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{node.address}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {node.storageUsed !== undefined ? (
                        <div className="flex flex-col">
                          <span>{formatBytes(node.storageUsed)} / {formatBytes(node.storageCommitted || 0)}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {((node.storageUsagePercent || 0) * 100).toFixed(2)}%
                          </span>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {node.uptime ? formatUptime(node.uptime) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {node.lastSeenTimestamp ? new Date(node.lastSeenTimestamp * 1000).toLocaleString() : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedNodes.length)} of {sortedNodes.length} nodes
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

      </div>

      {/* Node Details Modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedNode(null)}>
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-card z-10 border-b">
              <div>
                <CardTitle className="text-xl">Node Details</CardTitle>
                <p className="text-sm text-muted-foreground font-mono mt-1">{selectedNode.address}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedNode(null)}>
                <span className="text-xl">&times;</span>
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Identity</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Public Key:</span>
                      <span className="font-mono text-xs" title={selectedNode.pubkey}>
                        {(selectedNode.pubkey || 'N/A').slice(0, 8)}...{(selectedNode.pubkey || '').slice(-8)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span className="font-mono">{selectedNode.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Visibility:</span>
                      <Badge variant={selectedNode.is_public ? "default" : "secondary"}>
                        {selectedNode.is_public ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Network</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address:</span>
                      <span className="font-mono">{selectedNode.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RPC Port:</span>
                      <span className="font-mono">{selectedNode.rpc_port}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uptime:</span>
                      <span className="font-mono">{formatUptime(selectedNode.uptime || 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Storage</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Used:</span>
                      <span className="font-mono">{formatBytes(selectedNode.storage_used || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Committed:</span>
                      <span className="font-mono">{formatBytes(selectedNode.storage_committed || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Usage:</span>
                      <span className="font-mono">{((selectedNode.storage_usage_percent || 0) * 100).toFixed(4)}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Seen:</span>
                      <span className="font-mono">
                        {selectedNode.last_seen_timestamp 
                          ? new Date(selectedNode.last_seen_timestamp * 1000).toLocaleString() 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                  

                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}