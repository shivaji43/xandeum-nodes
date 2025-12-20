'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowDownUp } from 'lucide-react';
import { toast } from 'sonner';

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const XAND_MINT = 'XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx';

export default function SwapInterface() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [inputAmount, setInputAmount] = useState('');
  const [quoteResponse, setQuoteResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [solIcon, setSolIcon] = useState<string>('');
  const [xandIcon, setXandIcon] = useState<string>('');

  // Fetch token icons on mount
  useEffect(() => {
    const fetchIcons = async () => {
      try {
        const [solData, xandData] = await Promise.all([
          fetch(`https://lite-api.jup.ag/tokens/v2/search?query=${SOL_MINT}`).then(res => res.json()),
          fetch(`https://lite-api.jup.ag/tokens/v2/search?query=${XAND_MINT}`).then(res => res.json())
        ]);
        
        if (solData[0]?.icon) setSolIcon(solData[0].icon);
        if (xandData[0]?.icon) setXandIcon(xandData[0].icon);
      } catch (error) {
        console.error('Failed to fetch token icons:', error);
      }
    };
    fetchIcons();
  }, []);

  // Debounce quote fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputAmount && parseFloat(inputAmount) > 0) {
        fetchQuote();
      } else {
        setQuoteResponse(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputAmount]);

  const fetchQuote = async () => {
    setLoading(true);
    try {
      // Convert SOL to lamports (9 decimals)
      const amount = Math.floor(parseFloat(inputAmount) * 1000000000);
      
      const response = await fetch(
        `https://lite-api.jup.ag/swap/v1/quote?inputMint=${SOL_MINT}&outputMint=${XAND_MINT}&amount=${amount}&slippageBps=50`
      );
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setQuoteResponse(data);
    } catch (err: any) {
      console.error('Error fetching quote:', err);
      toast.error('Failed to fetch quote', {
        description: err.message || 'Please try again later.',
      });
      setQuoteResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const executeSwap = async () => {
    if (!publicKey || !quoteResponse) return;

    setSwapping(true);

    try {
      // Get serialized transaction
      const swapResponse = await (
        await fetch('https://lite-api.jup.ag/swap/v1/swap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quoteResponse,
            userPublicKey: publicKey.toString(),
            wrapAndUnwrapSol: true,
          }),
        })
      ).json();

      if (swapResponse.error) {
        throw new Error(swapResponse.error);
      }

      // Deserialize transaction
      const swapTransactionBuf = Buffer.from(swapResponse.swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      // Sign and send transaction
      const signature = await sendTransaction(transaction, connection);
      
      // Confirm transaction
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      }, 'confirmed');

      console.log('Swap successful:', signature);
      toast.success('Swap successful!', {
        description: `Transaction signature: ${signature.slice(0, 8)}...`,
      });
      setInputAmount('');
      setQuoteResponse(null);

    } catch (err: any) {
      console.error('Error executing swap:', err);
      toast.error('Swap failed', {
        description: err.message || 'An error occurred during the swap.',
      });
    } finally {
      setSwapping(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Swap SOL to XAND</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Input (SOL) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">You Pay</label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="pr-24"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {solIcon && <img src={solIcon} alt="SOL" className="w-5 h-5 rounded-full" />}
              <span className="text-sm font-bold text-muted-foreground">SOL</span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <ArrowDownUp className="h-6 w-6 text-muted-foreground" />
        </div>

        {/* Output (XAND) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">You Receive</label>
          <div className="relative">
            <Input
              type="text"
              readOnly
              value={quoteResponse ? (parseInt(quoteResponse.outAmount) / 1000000000).toFixed(6) : ''}
              className="pr-24 bg-muted"
              placeholder="0.00"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {xandIcon && <img src={xandIcon} alt="XAND" className="w-5 h-5 rounded-full" />}
              <span className="text-sm font-bold text-muted-foreground">XAND</span>
            </div>
          </div>
          {loading && <div className="text-xs text-muted-foreground animate-pulse">Fetching best price...</div>}
        </div>

        {/* Swap Button */}
        <Button 
          className="w-full" 
          size="lg"
          disabled={!publicKey || !quoteResponse || loading || swapping}
          onClick={executeSwap}
        >
          {swapping ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Swapping...
            </>
          ) : !publicKey ? (
            'Connect Wallet'
          ) : !inputAmount ? (
            'Enter Amount'
          ) : (
            'Swap'
          )}
        </Button>

        {/* Quote Details */}
        {quoteResponse && (
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <div className="flex justify-between">
              <span>Rate</span>
              <span>1 SOL ≈ {(parseInt(quoteResponse.outAmount) / parseInt(quoteResponse.inAmount)).toFixed(4)} XAND</span>
            </div>
            <div className="flex justify-between">
              <span>Price Impact</span>
              <span>{quoteResponse.priceImpactPct}%</span>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
