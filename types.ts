export interface ApiKeys {
  claude: string;
  chatgpt: string;
  gemini: string;
  grok: string;
}

export interface Claim {
  claim: string;
  ai: string;
}

export interface ConsensusClaim {
  claim: string;
  support: number;
  ais: string[];
  confidence: number;
}

export interface ConsensusResult {
  concepts: string[];
  claims: ConsensusClaim[];
  confidence: number;
}

export interface Divergence {
  ai: string;
  concepts: string[];
}

export interface Synthesis {
  question: string;
  timestamp: string;
  consensus: ConsensusResult;
  divergences: Divergence[];
  insights: Record<string, string[]>;
  sourceCount: number;
}