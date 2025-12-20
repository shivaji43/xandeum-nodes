'use client';

import { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClusterNode } from '../types/cluster';
import { cn } from '@/lib/utils';

interface HomeStatsProps {
  nodes: ClusterNode[];
}

const STATUS_COLORS = ['#10b981', '#3b82f6', '#6b7280']; // Green, Blue, Gray
const GAUGE_COLORS = ['#f59e0b', '#333333']; // Orange (Fair), Dark Gray (Background)

export default function HomeStats({ nodes }: HomeStatsProps) {
  
  // 1. Status Distribution
  const statusData = useMemo(() => {
    const now = Date.now() / 1000;
    const oneHourAgo = now - 3600;

    let publicRpc = 0;
    let privateRpc = 0;
    let notSeen = 0;

    nodes.forEach(node => {
      if (node.last_seen_timestamp && node.last_seen_timestamp < oneHourAgo) {
        notSeen++;
      } else if (node.is_public) {
        publicRpc++;
      } else {
        privateRpc++;
      }
    });

    return [
      { name: 'Public RPC', value: publicRpc, color: '#10b981' },
      { name: 'Private', value: privateRpc, color: '#3b82f6' },
      { name: 'Not Recently Seen', value: notSeen, color: '#6b7280' }
    ];
  }, [nodes]);

  // 2. Storage Overview
  const storageStats = useMemo(() => {
    const totalCommitted = nodes.reduce((acc, node) => acc + (node.storageCommitted || 0), 0);
    const totalUsed = nodes.reduce((acc, node) => acc + (node.storageUsed || 0), 0);
    // Mocking Total Capacity as "Available" from the image logic (Available = Total Capacity in the image roughly)
    // But logically Available = Capacity - Used.
    // Let's assume Total Capacity is the sum of all committed storage.
    
    const utilization = totalCommitted > 0 ? (totalUsed / totalCommitted) * 100 : 0;
    const nodesWithStorage = nodes.filter(n => (n.storageCommitted || 0) > 0).length;

    return {
      totalCapacity: totalCommitted,
      usedStorage: totalUsed,
      available: totalCommitted - totalUsed,
      utilization,
      nodesWithStorage
    };
  }, [nodes]);

  // 3. Network Health
  const healthStats = useMemo(() => {
    // Mocking logic to match the "Gauge" style
    // Score based on some metric, e.g., % of nodes seen recently
    const now = Date.now() / 1000;
    const fifteenMinsAgo = now - 900;
    const activeNodes = nodes.filter(n => n.last_seen_timestamp && n.last_seen_timestamp > fifteenMinsAgo).length;
    const score = nodes.length > 0 ? Math.round((activeNodes / nodes.length) * 100) : 0;
    
    // Determine label
    let label = 'Poor';
    if (score > 80) label = 'Excellent';
    else if (score > 60) label = 'Good';
    else if (score > 40) label = 'Fair';

    const publicRpcCount = nodes.filter(n => n.is_public).length;
    const publicRpcPercent = nodes.length > 0 ? Math.round((publicRpcCount / nodes.length) * 100) : 0;

    return {
      score,
      label,
      onlinePercent: score, // Using score as online % for now
      publicRpcPercent,
      quality: 18 // Mock static value or calculate based on version/uptime
    };
  }, [nodes]);


  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      
      {/* 1. Status Distribution */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="h-[160px] w-[160px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-3 text-xs flex-1 pl-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-mono font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2. Storage Overview */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Storage Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Capacity</span>
              <span className="font-mono">{formatBytes(storageStats.totalCapacity)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Used Storage</span>
              <span className="font-mono">{formatBytes(storageStats.usedStorage)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Available</span>
              <span className="font-mono text-emerald-500">{formatBytes(storageStats.available)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Network Utilization</span>
              <span>{storageStats.utilization.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-in-out" 
                style={{ width: `${storageStats.utilization}%` }}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
            <span>Nodes with storage data</span>
            <span className="font-mono">{storageStats.nodesWithStorage} of {nodes.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* 3. Network Health */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Network Health</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="h-[140px] w-full relative -mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: healthStats.score }, { value: 100 - healthStats.score }]}
                  cx="50%"
                  cy="75%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={GAUGE_COLORS[0]} />
                  <Cell fill={GAUGE_COLORS[1]} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 pointer-events-none">
              <span className="text-3xl font-bold">{healthStats.score}%</span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{healthStats.label}</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 text-center mt-4 pt-4 border-t border-border/50">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Online</div>
              <div className="font-mono text-sm font-medium">{healthStats.onlinePercent}%</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Public RPC</div>
              <div className="font-mono text-sm font-medium">{healthStats.publicRpcPercent}%</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase">Quality</div>
              <div className="font-mono text-sm font-medium">{healthStats.quality}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
