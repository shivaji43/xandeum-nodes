'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { Loader2, TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, Users, PieChart } from 'lucide-react';

const XAND_MINT = 'XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx';

interface TokenStatsData {
  price: number;
  liquidity: number;
  organicScore: number;
  mcap: number;
  fdv: number;
  holderCount: number;
  priceChange24h: number;
  stats24h: {
    buyVolume: number;
    sellVolume: number;
    numBuys: number;
    numSells: number;
  };
  performance: {
    '5m': number;
    '1h': number;
    '6h': number;
    '24h': number;
  };
  history: { time: string; price: number }[];
}

export default function TokenStats() {
  const [stats, setStats] = useState<TokenStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`https://lite-api.jup.ag/tokens/v2/search?query=${XAND_MINT}`);
        const data = await response.json();
        
        if (data && data[0]) {
          const token = data[0];
          
          // Mock history data
          const mockHistory = Array.from({ length: 24 }, (_, i) => ({
            time: `${i}:00`,
            price: token.usdPrice * (1 + (Math.random() * 0.1 - 0.05))
          }));

          setStats({
            price: token.usdPrice,
            liquidity: token.liquidity,
            organicScore: token.organicScore,
            mcap: token.mcap,
            fdv: token.fdv,
            holderCount: token.holderCount,
            priceChange24h: token.stats24h?.priceChange || 0,
            stats24h: {
              buyVolume: token.stats24h?.buyVolume || 0,
              sellVolume: token.stats24h?.sellVolume || 0,
              numBuys: token.stats24h?.numBuys || 0,
              numSells: token.stats24h?.numSells || 0,
            },
            performance: {
              '5m': token.stats5m?.priceChange || 0,
              '1h': token.stats1h?.priceChange || 0,
              '6h': token.stats6h?.priceChange || 0,
              '24h': token.stats24h?.priceChange || 0,
            },
            history: mockHistory
          });
        }
      } catch (error) {
        console.error('Failed to fetch token stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const volumeData = [
    { name: 'Buy', value: stats.stats24h.buyVolume, fill: '#22c55e' },
    { name: 'Sell', value: stats.stats24h.sellVolume, fill: '#ef4444' },
  ];

  const txData = [
    { name: 'Buys', value: stats.stats24h.numBuys, fill: '#22c55e' },
    { name: 'Sells', value: stats.stats24h.numSells, fill: '#ef4444' },
  ];

  const performanceData = [
    { name: '5m', value: stats.performance['5m'] },
    { name: '1h', value: stats.performance['1h'] },
    { name: '6h', value: stats.performance['6h'] },
    { name: '24h', value: stats.performance['24h'] },
  ];

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto mt-8">
      
      {/* Top Row: Price & Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.price.toFixed(4)}</div>
            <div className={`text-xs flex items-center mt-1 ${stats.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.priceChange24h >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {stats.priceChange24h.toFixed(2)}% (24h)
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.mcap / 1000000).toFixed(2)}M</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Liquidity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.liquidity / 1000).toFixed(2)}K</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Holders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.holderCount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1: Price History & Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Price History */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Price History (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.history}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                    labelStyle={{ color: 'var(--foreground)' }}
                    formatter={(value: number | undefined) => [value ? `$${value.toFixed(4)}` : 'N/A', 'Price']}
                  />
                  <Area type="monotone" dataKey="price" stroke="#8884d8" fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                     cursor={{fill: 'var(--muted)', opacity: 0.2}}
                     contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                     itemStyle={{ color: 'var(--foreground)' }}
                     labelStyle={{ color: 'var(--foreground)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Volume & Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Volume Split */}
        <Card>
          <CardHeader>
            <CardTitle>24h Volume Split</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'var(--muted)', opacity: 0.2}}
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                    labelStyle={{ color: 'var(--foreground)' }}
                    formatter={(value: number | undefined) => [value ? `$${value.toLocaleString()}` : 'N/A', 'Volume']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Split */}
        <Card>
          <CardHeader>
            <CardTitle>24h Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={txData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'var(--muted)', opacity: 0.2}}
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                    labelStyle={{ color: 'var(--foreground)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
