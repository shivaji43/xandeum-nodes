import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.devnet.xandeum.com:8899', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getClusterNodes',
        params: []
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cluster nodes: ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data.result
    });
  } catch (error) {
    console.error('Error fetching cluster nodes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cluster nodes' },
      { status: 500 }
    );
  }
}
