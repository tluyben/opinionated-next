import { OpenAIProvider } from './openai';

// OpenRouter uses OpenAI-compatible API
export class OpenRouterProvider extends OpenAIProvider {
  getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Next.js Opinionated Starter',
    };
  }
}