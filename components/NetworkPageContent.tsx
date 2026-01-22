'use client';

import AdvancedNetworkStats from '@/components/AdvancedNetworkStats';
import { useClusterData } from '@/hooks/useClusterData';
import { RefreshCw, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function NetworkPageContent() {
  const { nodes, loading, error, lastUpdated, dataSource, mapPoints, refresh } = useClusterData();

  if (loading && nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading Network Data...</p>
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
    <div className="min-h-screen bg-background p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image src="/xandeum.png" alt="Xandeum Logo" width={80} height={80} className="h-20 w-20" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Xandeum Network Statistics</h1>
              <p className="text-muted-foreground mt-1">
                Live Network Analytics • Source: {dataSource} • Updated {lastUpdated} • Auto-refresh: 30s
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

        <AdvancedNetworkStats nodes={nodes} geoData={mapPoints} />
      </div>
    </div>
  );
}
