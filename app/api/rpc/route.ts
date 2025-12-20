import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rpcUrl = process.env.SOLANA_RPC_URL;

    if (!rpcUrl) {
      return NextResponse.json(
        { error: 'SOLANA_RPC_URL is not defined' },
        { status: 500 }
      );
    }

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('RPC Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy RPC request' },
      { status: 500 }
    );
  }
}
