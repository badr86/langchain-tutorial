export interface Capabilities {
  whatItCanDo: string[];
  bestUseCases: string[];
  limitations: string[];
  keyTakeaways: string[];
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  category: 'prompts' | 'chains' | 'memory' | 'agents' | 'rag';
  codeSnippet: string;
  capabilities?: Capabilities | null;
}

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  timestamp: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  hasOpenAIKey: boolean;
}
