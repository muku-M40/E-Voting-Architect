
export interface Candidate {
  id: string;
  name: string;
  party: string;
  votes: number;
  avatar: string;
}

export interface VoteRecord {
  id: string;
  voterHash: string;
  candidateId: string;
  timestamp: number;
  blockNumber: number;
  previousHash: string;
  hash: string;
}

export interface AuditIssue {
  severity: 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  line?: number;
}

export interface AuditResult {
  issues: AuditIssue[];
  summary: string;
  securityScore: number;
}

export type ViewType = 'dashboard' | 'vote' | 'audit' | 'architect' | 'ledger';
