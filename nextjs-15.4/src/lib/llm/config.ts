import { ProvidersConfig, LLMProvider } from './types';

// Default models for each provider
export const DEFAULT_MODELS: Record<LLMProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'],
  openrouter: ['anthropic/claude-3-5-sonnet', 'openai/gpt-4o', 'meta-llama/llama-3.1-70b-instruct'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  cerebras: ['llama-3.3-70b', 'llama-3.1-8b', 'llama-3.1-70b']
};

// Get configured providers from environment variables
export function getConfiguredProviders(): ProvidersConfig {
  const providers: ProvidersConfig = {};

  // OpenAI
  if (process.env.OPENAI_API_KEY) {
    providers.openai = {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      models: DEFAULT_MODELS.openai
    };
  }

  // Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    providers.anthropic = {
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseUrl: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
      models: DEFAULT_MODELS.anthropic
    };
  }

  // OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    providers.openrouter = {
      apiKey: process.env.OPENROUTER_API_KEY,
      baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      models: DEFAULT_MODELS.openrouter
    };
  }

  // Groq
  if (process.env.GROQ_API_KEY) {
    providers.groq = {
      apiKey: process.env.GROQ_API_KEY,
      baseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
      models: DEFAULT_MODELS.groq
    };
  }

  // Cerebras
  if (process.env.CEREBRAS_API_KEY) {
    providers.cerebras = {
      apiKey: process.env.CEREBRAS_API_KEY,
      baseUrl: process.env.CEREBRAS_BASE_URL || 'https://api.cerebras.ai/v1',
      models: DEFAULT_MODELS.cerebras
    };
  }

  return providers;
}