'use client';

import { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClusterNode } from '../types/cluster';

interface ClusterStatsProps {
  nodes: ClusterNode[];
  geoData: { lat: number; lon: number; country?: string; city?: string; query?: string }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function ClusterStats({ nodes, geoData }: ClusterStatsProps) {
  
  // 1. Storage Overview
  const storageData = useMemo(() => {
    const totalCommitted = nodes.reduce((acc, node) => acc + (node.storageCommitted || 0), 0);
    const totalUsed = nodes.reduce((acc, node) => acc + (node.storageUsed || 0), 0);
    const free = totalCommitted - totalUsed;

    return [
      { name: 'Used', value: totalUsed },
      { name: 'Free', value: free > 0 ? free : 0 }
    ];
  }, [nodes]);

  // 2. Node Visibility (Public/Private)
  const visibilityData = useMemo(() => {
    const publicNodes = nodes.filter(n => n.is_public).length;
    const privateNodes = nodes.length - publicNodes;
    return [
      { name: 'Public', value: publicNodes },
      { name: 'Private', value: privateNodes }
    ];
  }, [nodes]);

  // 3. Version Distribution
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

  // 5. Geolocation - Country
  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    geoData.forEach(d => {
      if (d.country) {
        counts[d.country] = (counts[d.country] || 0) + 1;
      }
    });
    // Top 10 countries + Others
    const sorted = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    if (sorted.length > 10) {
      const top10 = sorted.slice(0, 10);
      const others = sorted.slice(10).reduce((acc, curr) => acc + curr.value, 0);
      return [...top10, { name: 'Others', value: others }];
    }
    return sorted;
  }, [geoData]);

  // 6. Geolocation - City
  const cityData = useMemo(() => {
    const counts: Record<string, number> = {};
    geoData.forEach(d => {
      if (d.city) {
        counts[d.city] = (counts[d.city] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 cities
  }, [geoData]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      
      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Network Storage Usage</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={storageData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {storageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#22c55e'} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number | undefined) => formatBytes(value || 0)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Node Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Node Visibility</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={visibilityData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label
              >
                {visibilityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Uptime Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Uptime Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={uptimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

       {/* Version Distribution */}
       <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Node Versions</CardTitle>
        </CardHeader>
        <CardContent className="h-[275px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={versionData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                {versionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Country Distribution */}
      <Card className="md:col-span-1 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Top Countries</CardTitle>
        </CardHeader>
        <CardContent className="h-[275px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={countryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                {countryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* City Distribution */}
      <Card className="md:col-span-1 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Top Cities</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} fontSize={10} />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
}
