"use client";

import { useState } from 'react';
import { Connection, Keypair, sendAndConfirmTransaction } from '@solana/web3.js';
import { bigbang } from '@xandeum/web3.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Loader2, CheckCircle, XCircle } from 'lucide-react';

export function StorageHealthCheck() {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [step, setStep] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [txSignature, setTxSignature] = useState('');

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const runHealthCheck = async () => {
    setStatus('running');
    setLogs([]);
    setStep('Initializing...');
    
    try {
      const connection = new Connection('https://api.devnet.xandeum.com:8899', 'confirmed');
      const signer = Keypair.generate();
      
      // 1. Airdrop
      setStep('Requesting Airdrop...');
      addLog('Requesting 1 SOL airdrop...');
      try {
        const airdropSig = await connection.requestAirdrop(signer.publicKey, 1000000000);
        await connection.confirmTransaction(airdropSig);
        addLog('Airdrop received.');
      } catch (e) {
        addLog('Airdrop skipped (might have funds).');
      }

      // 2. BigBang (Create FS)
      setStep('Creating File System...');
      addLog('Creating File System (BigBang)...');
      // @ts-ignore
      const tx1 = await bigbang(signer.publicKey);
      const sig1 = await sendAndConfirmTransaction(connection, tx1, [signer]);
      addLog(`File System created. Tx: ${sig1.slice(0, 8)}...`);

      // 3. Create File
      setStep('Creating File...');
      addLog('Creating file "hello.txt"...');
      // @ts-ignore
      const { createFile } = await import('@xandeum/web3.js');
      // @ts-ignore
      const tx2 = await createFile('1', '/', 'hello.txt', signer.publicKey);
      const sig2 = await sendAndConfirmTransaction(connection, tx2, [signer]);
      addLog(`File created. Tx: ${sig2.slice(0, 8)}...`);

      // 4. Poke (Write)
      setStep('Writing Data...');
      addLog('Writing "Hello Xandeum!" to file...');
      // @ts-ignore
      const { poke } = await import('@xandeum/web3.js');
      // @ts-ignore
      const tx3 = await poke('1', '/hello.txt', 0, Buffer.from('Hello Xandeum!'), signer.publicKey);
      const sig3 = await sendAndConfirmTransaction(connection, tx3, [signer]);
      addLog(`Data written. Tx: ${sig3.slice(0, 8)}...`);

      setTxSignature(sig3);
      setStatus('success');
      setStep('Complete!');
      
    } catch (err) {
      console.error(err);
      setStatus('error');
      setStep('Failed');
      addLog(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <Card className="border-indigo-500/20 bg-indigo-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Database className="h-4 w-4" />
          Storage Network Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Verify the Xandeum Storage Layer by creating a temporary file system on Devnet.
          </p>
          
          {status === 'idle' && (
            <Button onClick={runHealthCheck} size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Run Health Check
            </Button>
          )}

          {status === 'running' && (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              <span className="text-xs font-mono text-indigo-500">{step}</span>
              <div className="w-full max-h-24 overflow-y-auto bg-black/5 dark:bg-white/5 p-2 rounded text-[10px] font-mono">
                {logs.map((log, i) => <div key={i}>{log}</div>)}
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
                <CheckCircle className="h-4 w-4" />
                <span>Success</span>
              </div>
              <div className="w-full max-h-24 overflow-y-auto bg-black/5 dark:bg-white/5 p-2 rounded text-[10px] font-mono">
                {logs.map((log, i) => <div key={i}>{log}</div>)}
              </div>
              {txSignature && (
                <div className="text-[10px] font-mono bg-black/5 dark:bg-white/5 p-2 rounded break-all">
                  Tx: {txSignature}
                </div>
              )}
              <Button onClick={() => setStatus('idle')} variant="outline" size="sm" className="w-full mt-2">
                Run Again
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-500 text-sm font-bold">
                <XCircle className="h-4 w-4" />
                <span>Failed</span>
              </div>
              <div className="w-full max-h-24 overflow-y-auto bg-red-500/10 p-2 rounded text-[10px] font-mono text-red-500">
                {logs.map((log, i) => <div key={i}>{log}</div>)}
              </div>
              <Button onClick={runHealthCheck} variant="outline" size="sm" className="w-full mt-2">
                Retry
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
