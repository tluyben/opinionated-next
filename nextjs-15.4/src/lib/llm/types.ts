export type LLMProvider = 'openai' | 'anthropic' | 'openrouter' | 'groq' | 'cerebras';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMStreamResponse {
  content: string;
  done: boolean;
  error?: string;
}

export interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  models: string[];
}

export type ProvidersConfig = {
  [K in LLMProvider]?: ProviderConfig;
};