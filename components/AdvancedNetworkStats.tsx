'use client';

import { useMemo } from 'react';
import { ClusterNode } from '../types/cluster';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, ScatterChart, Scatter, RadialBarChart, RadialBar, Treemap
} from 'recharts';

interface AdvancedNetworkStatsProps {
  nodes: ClusterNode[];
  geoData: { lat: number; lon: number; label?: string; node?: ClusterNode; country?: string; city?: string }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

export default function AdvancedNetworkStats({ nodes, geoData }: AdvancedNetworkStatsProps) {
  
  // 1. Version Distribution
  const versionData = useMemo(() => {
    const counts: Record<string, number> = {};
    nodes.forEach(node => {
      const v = node.version || 'Unknown';
      counts[v] = (counts[v] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [nodes]);

  // 2. Country Distribution
  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    geoData.forEach(point => {
      const c = point.country || 'Unknown';
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10
  }, [geoData]);

  // 3. Storage Usage Histogram
  const storageHistogramData = useMemo(() => {
    const buckets = Array(10).fill(0);
    nodes.forEach(node => {
      const usage = (node.storageUsagePercent || 0) * 100;
      const bucketIndex = Math.min(Math.floor(usage / 10), 9);
      buckets[bucketIndex]++;
    });
    return buckets.map((count, i) => ({
      range: `${i * 10}-${(i + 1) * 10}%`,
      count
    }));
  }, [nodes]);

  // 4. Uptime Distribution
  const uptimeData = useMemo(() => {
    const buckets = {
      '< 1h': 0,
      '1h - 24h': 0,
      '1d - 7d': 0,
      '> 7d': 0
    };
    nodes.forEach(node => {
      const uptime = node.uptime || 0;
      if (uptime < 3600) buckets['< 1h']++;
      else if (uptime < 86400) buckets['1h - 24h']++;
      else if (uptime < 604800) buckets['1d - 7d']++;
      else buckets['> 7d']++;
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [nodes]);

  // 5. Public vs Private
  const visibilityData = useMemo(() => {
    let publicNodes = 0;
    let privateNodes = 0;
    nodes.forEach(node => {
      if (node.is_public) publicNodes++;
      else privateNodes++;
    });
    return [
      { name: 'Public', value: publicNodes },
      { name: 'Private', value: privateNodes }
    ];
  }, [nodes]);

  // 6. Top Storage Nodes
  const topStorageNodes = useMemo(() => {
    return [...nodes]
      .sort((a, b) => (b.storageUsed || 0) - (a.storageUsed || 0))
      .slice(0, 5)
      .map(node => ({
        name: (node.pubkey || '').slice(0, 8),
        value: (node.storageUsed || 0) / (1024 * 1024 * 1024) // GB
      }));
  }, [nodes]);

  // 7. Storage vs Uptime Correlation
  const correlationData = useMemo(() => {
    return nodes.map(node => ({
      x: (node.uptime || 0) / 3600, // Hours
      y: (node.storageUsed || 0) / (1024 * 1024), // MB
      z: 1
    }));
  }, [nodes]);

  // 8. Network Health (Online % based on last seen < 5 mins)
  const healthData = useMemo(() => {
    const now = Date.now() / 1000;
    const online = nodes.filter(n => (now - (n.lastSeenTimestamp || 0)) < 300).length;
    const percentage = nodes.length > 0 ? (online / nodes.length) * 100 : 0;
    return [{ name: 'Online', value: percentage, fill: '#10b981' }];
  }, [nodes]);

  // 9. City Concentration
  const cityData = useMemo(() => {
    const counts: Record<string, number> = {};
    geoData.forEach(point => {
      if (point.city) {
        counts[point.city] = (counts[point.city] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, size]) => ({ name, size }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 20);
  }, [geoData]);

  // 10. RPC Port Usage
  const rpcPortData = useMemo(() => {
    const counts: Record<string, number> = {};
    nodes.forEach(node => {
      const port = node.rpc_port || 'Unknown';
      counts[port] = (counts[port] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [nodes]);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill="var(--foreground)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold tracking-tight">Advanced Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Version Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Version Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={versionData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={renderCustomizedLabel}
                >
                  {versionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 2. Country Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: 'var(--foreground)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                  cursor={{fill: 'var(--muted)', opacity: 0.2}}
                />
                <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                  {countryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 3. Storage Usage Histogram */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Usage Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storageHistogramData} margin={{ bottom: 20 }}>
                <XAxis dataKey="range" tick={{fontSize: 10, fill: 'var(--foreground)'}} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{fill: 'var(--foreground)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                  cursor={{fill: 'var(--muted)', opacity: 0.2}}
                />
                <Bar dataKey="count" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 4. Uptime Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Uptime Duration</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={uptimeData} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{fill: 'var(--foreground)', fontSize: 12}} />
                <YAxis tick={{fill: 'var(--foreground)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 5. Public vs Private */}
        <Card>
          <CardHeader>
            <CardTitle>Network Visibility</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visibilityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {visibilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#64748b'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'var(--foreground)' }}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 6. Top Storage Nodes */}
        <Card>
          <CardHeader>
            <CardTitle>Top Storage Providers (GB)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topStorageNodes} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10, fontFamily: 'monospace', fill: 'var(--foreground)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                  cursor={{fill: 'var(--muted)', opacity: 0.2}}
                />
                <Bar dataKey="value" fill="#ffc658" radius={[0, 4, 4, 0]}>
                  {countryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 7. Storage vs Uptime */}
        <Card>
          <CardHeader>
            <CardTitle>Storage (MB) vs Uptime (h)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <XAxis type="number" dataKey="x" name="Uptime" unit="h" tick={{fill: 'var(--foreground)'}} />
                <YAxis type="number" dataKey="y" name="Storage" unit="MB" tick={{fill: 'var(--foreground)'}} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
                <Scatter name="Nodes" data={correlationData} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Real-time Health Score</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: healthData[0].value }, { value: 100 - healthData[0].value }]}
                  cx="50%"
                  cy="70%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="var(--muted)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-4xl font-bold text-emerald-500">
                {healthData[0].value.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">Online Nodes</div>
            </div>
          </CardContent>
        </Card>


        {/* 9. City Concentration */}
        <Card>
          <CardHeader>
            <CardTitle>City Concentration</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={cityData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                fill="#8884d8"
              >
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                />
              </Treemap>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 10. RPC Port Usage */}
        <Card>
          <CardHeader>
            <CardTitle>RPC Port Usage</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rpcPortData} margin={{ bottom: 20 }}>
                <XAxis dataKey="name" tick={{fill: 'var(--foreground)'}} />
                <YAxis tick={{fill: 'var(--foreground)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  labelStyle={{ color: 'var(--foreground)' }}
                  cursor={{fill: 'var(--muted)', opacity: 0.2}}
                />
                <Bar dataKey="value" fill="#ff8042" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
