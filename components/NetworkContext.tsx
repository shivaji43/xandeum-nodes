'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Network = 'devnet' | 'mainnet';

interface NetworkContextType {
  network: Network;
  setNetwork: (network: Network) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [network, setNetwork] = useState<Network>('mainnet');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('xandeum-network');
    if (saved === 'devnet' || saved === 'mainnet') {
      setNetwork(saved);
    }
  }, []);

  const handleSetNetwork = (newNetwork: Network) => {
    setNetwork(newNetwork);
    localStorage.setItem('xandeum-network', newNetwork);
  };

  if (!mounted) {
    return null; // or a loading spinner if preferred, but null avoids hydration mismatch for now
  }

  return (
    <NetworkContext.Provider value={{ network, setNetwork: handleSetNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
