export interface ClusterNode {
  featureSet: number;
  gossip: string;
  pubkey: string;
  pubsub: string;
  rpc: string;
  serveRepair: string;
  shredVersion: number;
  tpu: string;
  tpuForwards: string;
  tpuForwardsQuic: string;
  tpuQuic: string;
  tpuVote: string;
  tvu: string;
  version: string;
}

export interface ApiResponse {
  success: boolean;
  data?: ClusterNode[];
  error?: string;
}
