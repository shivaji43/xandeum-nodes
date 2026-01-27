'use client';

import { useState, useMemo } from 'react';
import { ClusterNode } from '../types/cluster';
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
  ChevronRight,
  Database,
} from 'lucide-react';
import { ModeToggle } from './mode-toggle';

import WorldMap from './WorldMap';
import { useClusterData } from '@/hooks/useClusterData';
import { useWatchlist } from '@/hooks/useWatchlist';
import { Star } from 'lucide-react';
import HomeStats from './HomeStats';
import Image from 'next/image';


export default function ClusterNodesDashboard({ 
  onlyWatchlist = false,
  hideMap = false,
  hideStats = false
}: { 
  onlyWatchlist?: boolean;
  hideMap?: boolean;
  hideStats?: boolean;
}) {
  const { nodes, loading, error, lastUpdated, dataSource, mapPoints, refresh, network } = useClusterData();
  const { watchlist, toggleWatchlist, isInWatchlist } = useWatchlist();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [versionFilter, setVersionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ClusterNode; direction: 'asc' | 'desc' } | null>({ key: 'status', direction: 'desc' });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedNode, setSelectedNode] = useState<ClusterNode | null>(null);
  const [publicFilter, setPublicFilter] = useState<string>('all');
  const [selectedNodes, setSelectedNodes] = useState<ClusterNode[] | null>(null);

  const handleNodeSelect = (node: ClusterNode) => {
    setSelectedNode(node);
    // Keep selectedNodes for "Back" functionality if it was a multi-selection
  };

  const handleBackToCluster = () => {
    setSelectedNode(null);
  };

  const handleCloseModal = () => {
    setSelectedNode(null);
    setSelectedNodes(null);
  };

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
        (node.version?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (node.address?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      const matchesVersion = versionFilter === 'all' || node.version === versionFilter;
      const matchesPublic = publicFilter === 'all' || (publicFilter === 'public' ? node.is_public : !node.is_public);
      const matchesStatus = statusFilter === 'all' || node.status === statusFilter;
      const matchesWatchlist = !onlyWatchlist || isInWatchlist(node.pubkey);

      return matchesSearch && matchesVersion && matchesPublic && matchesStatus && matchesWatchlist;
    });
  }, [nodes, searchQuery, versionFilter, publicFilter, statusFilter, onlyWatchlist, watchlist]);

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
            <Button onClick={refresh} variant="outline" className="w-full">
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }



  return (
    <div className="p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">

            <Image src="/xandeum.png" alt="Xandeum Logo" width={80} height={80} className="h-20 w-20" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Xandeum Network</h1>
              <p className="text-muted-foreground mt-1">
                Live Cluster Analytics • Source: {dataSource} • Updated {lastUpdated} • Auto-refresh: 30s
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button onClick={refresh} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {!hideMap && (
          <WorldMap 
            points={mapPoints} 
            onPointClick={(point) => {
              if (point.nodes && point.nodes.length > 0) {
                if (point.nodes.length === 1) {
                  setSelectedNode(point.nodes[0]);
                  setSelectedNodes(null);
                } else {
                  setSelectedNodes(point.nodes);
                  setSelectedNode(null);
                }
              }
            }}
          />
        )}

        {/* Home Stats */}
        {!hideStats && <HomeStats nodes={nodes} />}



        {!hideStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total pNodes</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nodes.length}</div>
              <p className="text-xs text-muted-foreground">Active in gossip</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Storage Committed</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatBytes(nodes.reduce((acc, node) => acc + (node.storageCommitted || 0), 0))}
              </div>
              <p className="text-xs text-muted-foreground">Across all nodes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Node Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-2xl font-bold text-emerald-500">
                    {nodes.filter(n => n.status === 'Online').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <div className="text-2xl font-bold text-muted-foreground">
                    {nodes.filter(n => n.status !== 'Online').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Offline</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Storage / Pod</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatBytes(nodes.length > 0 ? nodes.reduce((acc, node) => acc + (node.storageCommitted || 0), 0) / nodes.length : 0)}
              </div>
              <p className="text-xs text-muted-foreground">Per participating node</p>
            </CardContent>
          </Card>

        </div>
        )}

        {/* Filters & Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border">
            <div className="flex flex-1 w-full md:max-w-sm items-center space-x-2">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Pubkey, Version, or Gossip..."
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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Offline">Offline</SelectItem>
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
                <TableHead>Status</TableHead>
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
                    onClick={() => {
                      setSelectedNode(node);
                      setSelectedNodes(null);
                    }}
                  >
                    <TableCell className="font-medium text-muted-foreground">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 mr-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (node.pubkey) toggleWatchlist(node.pubkey);
                          }}
                        >
                          <Star 
                            className={`h-4 w-4 ${isInWatchlist(node.pubkey) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                          />
                        </Button>
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
                    <TableCell>
                      <Badge variant={node.status === 'Online' ? 'default' : 'destructive'} 
                             className={node.status === 'Online' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}>
                        {node.status || 'Unknown'}
                      </Badge>
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
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              title="First Page"
            >
              <span className="sr-only">First Page</span>
              <span className="text-xs">{'<<'}</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              title="Previous Page"
            >
              <span className="sr-only">Previous Page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(1, currentPage - 2);
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                
                if (endPage - startPage < maxVisiblePages - 1) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                if (startPage > 1) {
                  pages.push(
                    <span key="start-ellipsis" className="px-1 text-muted-foreground">...</span>
                  );
                }

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={currentPage === i ? "default" : "outline"}
                      size="sm"
                      className={`h-8 w-8 ${currentPage === i ? "" : "hover:bg-muted"}`}
                      onClick={() => setCurrentPage(i)}
                    >
                      {i}
                    </Button>
                  );
                }

                if (endPage < totalPages) {
                  pages.push(
                    <span key="end-ellipsis" className="px-1 text-muted-foreground">...</span>
                  );
                }
                
                return pages;
              })()}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              title="Next Page"
            >
              <span className="sr-only">Next Page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
             <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              title="Last Page"
            >
              <span className="sr-only">Last Page</span>
              <span className="text-xs">{'>>'}</span>
            </Button>
          </div>
        </div>

      </div>

      {/* Node Selection Modal (Cluster View) */}
      {selectedNodes && !selectedNode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" onClick={e => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-card z-10 border-b p-4">
              <div>
                <CardTitle className="text-xl">Cluster Nodes</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedNodes.length} nodes at this location
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                <span className="text-xl">&times;</span>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {selectedNodes.map((node) => (
                  <div 
                    key={node.pubkey} 
                    className="p-4 hover:bg-muted/50 cursor-pointer flex items-center justify-between"
                    onClick={() => handleNodeSelect(node)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">
                          {(node.pubkey || 'Unknown').slice(0, 8)}...{(node.pubkey || '').slice(-8)}
                        </span>
                        {node.isPNode && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 border-emerald-500 text-emerald-500">
                            pNode
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {node.address}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {node.version || 'Unknown'}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Node Details Modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-card z-10 border-b">
              <div className="flex items-center gap-2">
                {selectedNodes && (
                  <Button variant="ghost" size="icon" onClick={handleBackToCluster} className="mr-2">
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}
                <div>
                  <CardTitle className="text-xl">Node Details</CardTitle>
                  <p className="text-sm text-muted-foreground font-mono mt-1">{selectedNode.address}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCloseModal}>
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
                      <span className="text-muted-foreground">Current Status:</span>
                      <Badge variant={selectedNode.status === 'Online' ? 'default' : 'destructive'}
                             className={selectedNode.status === 'Online' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}>
                        {selectedNode.status || 'Unknown'}
                      </Badge>
                    </div>
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