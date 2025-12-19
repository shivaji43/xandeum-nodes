import { NextResponse } from 'next/server';

// Simple in-memory cache
const geoCache = new Map<string, { lat: number; lon: number }>();

export async function POST(request: Request) {
  try {
    const ips: string[] = await request.json();
    
    if (!Array.isArray(ips) || ips.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const results: { query: string; lat: number; lon: number }[] = [];
    const missingIps: string[] = [];

    // Check cache first
    for (const ip of ips) {
      if (geoCache.has(ip)) {
        const cached = geoCache.get(ip)!;
        results.push({ query: ip, ...cached });
      } else {
        missingIps.push(ip);
      }
    }

    // Fetch missing IPs from ip-api.com
    if (missingIps.length > 0) {
      // Process in batches of 100 (API limit)
      const batchSize = 100;
      for (let i = 0; i < missingIps.length; i += batchSize) {
        const batch = missingIps.slice(i, i + batchSize);
        
        try {
          const response = await fetch('http://ip-api.com/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batch.map(ip => ({ query: ip, fields: "lat,lon,query" })))
          });

          if (response.ok) {
            const data = await response.json();
            data.forEach((item: any) => {
              if (item.lat && item.lon) {
                geoCache.set(item.query, { lat: item.lat, lon: item.lon });
                results.push({ query: item.query, lat: item.lat, lon: item.lon });
              }
            });
          }
          
          // Small delay to respect rate limits
          if (i + batchSize < missingIps.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (err) {
          console.error('Error fetching batch from ip-api.com:', err);
        }
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in geo proxy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
