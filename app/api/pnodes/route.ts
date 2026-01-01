import { NextResponse } from 'next/server';
import http from 'http';

export async function POST(): Promise<NextResponse> {
  return new Promise<NextResponse>((resolve) => {
    const postData = JSON.stringify({
      jsonrpc: '2.0',
      method: 'get-pods-with-stats',
      id: 1
    });

    const options = {
      hostname: ['173.212.207.32', '45.151.122.77', '84.21.171.111', '173.249.54.191'][Math.floor(Math.random() * 4)],
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

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
             const json = JSON.parse(data);
             resolve(NextResponse.json(json));
          } else {
             resolve(NextResponse.json(
                { error: `RPC call failed: ${res.statusCode} ${res.statusMessage}` },
                { status: res.statusCode || 500 }
             ));
          }
        } catch (e) {
          console.error('Error parsing RPC response:', e);
          resolve(NextResponse.json(
            { error: 'Failed to parse RPC response' },
            { status: 500 }
          ));
        }
      });
    });

    req.on('error', (e) => {
      console.error('Error in pnodes API:', e);
      resolve(NextResponse.json(
        { error: `Failed to fetch data from RPC: ${e.message}` },
        { status: 500 }
      ));
    });

    req.write(postData);
    req.end();
  });
}

export async function GET() {
    return POST();
}
