import http from 'http';

export interface NetworkStats {
  totalNodes: number;
  onlineNodes: number;
  offlineNodes: number;
  healthScore: number; // 0-100 percentage of online nodes
  totalStorageUsed: string;
  versions: Record<string, number>;
  publicNodes: number;
  privateNodes: number;
  topCountries: Record<string, number>;
  topCities: Record<string, number>;
  lastUpdated: string;
}

export interface PodCredit {
  credits: number;
  pod_id: string;
}

export interface CreditsResponse {
  pods_credits: PodCredit[];
  status: string;
}

// In-memory cache for geo data (mirrors api/geo/route.ts cache)
const geoCache = new Map<string, { country?: string; city?: string }>();

async function fetchRpcData(): Promise<any> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      jsonrpc: '2.0',
      method: 'get-pods-with-stats',
      id: 1
    });

    const options = {
      hostname: '173.212.207.32',
      port: 6000,
      path: '/rpc',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
             resolve(JSON.parse(data));
          } else {
             reject(new Error(`RPC failed: ${res.statusCode}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function fetchGeoData(ips: string[]): Promise<Record<string, { country?: string; city?: string }>> {
  const results: Record<string, { country?: string; city?: string }> = {};
  const missingIps: string[] = [];

  // Check cache
  for (const ip of ips) {
    if (geoCache.has(ip)) {
      results[ip] = geoCache.get(ip)!;
    } else {
      missingIps.push(ip);
    }
  }

  // Fetch missing
  if (missingIps.length > 0) {
    const batchSize = 100;
    for (let i = 0; i < missingIps.length; i += batchSize) {
      const batch = missingIps.slice(i, i + batchSize);
      try {
        // Use ip-api.com directly as requested to avoid circular dependency on app route
        // We use fetch here, assuming node environment supports it (Node 18+)
        const response = await fetch('http://ip-api.com/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(batch.map(ip => ({ query: ip, fields: "country,city,query" })))
        });

        if (response.ok) {
          const data = await response.json();
           data.forEach((item: any) => {
             const geo = { country: item.country, city: item.city };
             geoCache.set(item.query, geo);
             results[item.query] = geo;
           });
        }
      } catch (err) {
        console.error('Geo fetch error in bot-data:', err);
      }
    }
  }

  return results;
}

export async function getNetworkStats(): Promise<NetworkStats> {
  const data = await fetchRpcData();
  const pods = data.result?.pods || data.result?.value?.pods || [];
  
  const now = Date.now() / 1000;
  let onlineCount = 0;
  let offlineCount = 0;
  let publicCount = 0;
  let privateCount = 0;
  let totalStorage = 0;
  const versionCounts: Record<string, number> = {};
  const countryCounts: Record<string, number> = {};
  const cityCounts: Record<string, number> = {};

  const uniqueNodes = new Map();
  const uniqueIps = new Set<string>();

  // Deduplicate
  pods.forEach((pod: any) => {
    if (!uniqueNodes.has(pod.pubkey)) {
      uniqueNodes.set(pod.pubkey, pod);
      // Extract IP (naive check assuming host:port or just host)
      const ip = pod.address?.split(':')[0];
      if (ip && ip !== '127.0.0.1' && ip !== '0.0.0.0') {
        uniqueIps.add(ip);
      }
    }
  });

  // Fetch Geo Data
  const ipMap = await fetchGeoData(Array.from(uniqueIps));

  uniqueNodes.forEach((node) => {
    // Status
    const isOnline = (now - node.last_seen_timestamp) < 300;
    if (isOnline) onlineCount++; else offlineCount++;

    // Public/Private
    if (node.is_public) publicCount++; else privateCount++;

    // Storage
    if (node.storage_used) totalStorage += node.storage_used;

    // Versions
    const ver = node.version || 'Unknown';
    versionCounts[ver] = (versionCounts[ver] || 0) + 1;

    // Geo Stats
    const ip = node.address?.split(':')[0];
    if (ip && ipMap[ip]) {
      const { country, city } = ipMap[ip];
      if (country) countryCounts[country] = (countryCounts[country] || 0) + 1;
      if (city) cityCounts[city] = (cityCounts[city] || 0) + 1;
    }
  });

  // Sort Top Countries
  const sortedCountries = Object.fromEntries(
    Object.entries(countryCounts).sort(([,a], [,b]) => b - a).slice(0, 5)
  );

   // Sort Top Cities
   const sortedCities = Object.fromEntries(
    Object.entries(cityCounts).sort(([,a], [,b]) => b - a).slice(0, 5)
  );


  // Format Storage
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalNodes = uniqueNodes.size;
  const healthScore = totalNodes > 0 ? Math.round((onlineCount / totalNodes) * 100) : 0;

  return {
    totalNodes,
    onlineNodes: onlineCount,
    offlineNodes: offlineCount,
    healthScore,
    publicNodes: publicCount,
    privateNodes: privateCount,
    totalStorageUsed: formatBytes(totalStorage),
    versions: versionCounts,
    topCountries: sortedCountries,
    topCities: sortedCities,
    lastUpdated: new Date().toISOString()
  };
}

export async function getPodCredits(): Promise<CreditsResponse> {
  try {
    const response = await fetch('https://podcredits.xandeum.network/api/pods-credits');
    if (!response.ok) {
      throw new Error(`Failed to fetch pod credits: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching pod credits:', error);
    // Return empty structure or rethrow depending on desired behavior. 
    // For now, rethrowing so the helpful bot can report the error.
    throw error;
  }
}

