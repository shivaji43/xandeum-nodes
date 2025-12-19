export interface ClusterNode {
  address: string;
  is_public: boolean;
  last_seen_timestamp: number;
  pubkey: string;
  rpc_port: number;
  storage_committed: number;
  storage_usage_percent: number;
  storage_used: number;
  uptime: number;
  version: string;
  
  // Computed/Mapped fields for UI compatibility (optional)
  gossip?: string; 
  lastSeen?: string;
  isPNode?: boolean;
  storageCommitted?: number;
  storageUsagePercent?: number;
  storageUsed?: number;
  rpcPort?: number;
  isPublic?: boolean;
  lastSeenTimestamp?: number;
  shredVersion?: number; // Not in new RPC, keeping for compatibility if needed or remove
}

export interface ApiResponse {
  jsonrpc?: string;
  result?: {
    context?: any;
    value?: {
      pods: ClusterNode[];
      total_count: number;
    };
    pods?: ClusterNode[];
    total_count?: number;
  };
  id?: number;
  error?: string; // For API errors
  success?: boolean; // For backward compatibility if needed, or remove
  source?: string;
}
