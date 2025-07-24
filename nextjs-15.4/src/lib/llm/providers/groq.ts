import { OpenAIProvider } from './openai';

// Groq uses OpenAI-compatible API
export class GroqProvider extends OpenAIProvider {
  // Groq is fully OpenAI-compatible, so we can use the same implementation
}