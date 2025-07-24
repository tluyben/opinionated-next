import { OpenAIProvider } from './openai';

// Cerebras uses OpenAI-compatible API
export class CerebrasProvider extends OpenAIProvider {
  // Cerebras is fully OpenAI-compatible, so we can use the same implementation
}