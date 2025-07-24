import { BaseLLMProvider } from './base';
import { LLMMessage } from '../types';

export class OpenAIProvider extends BaseLLMProvider {
  createRequestBody(messages: LLMMessage[], systemPrompt?: string) {
    const allMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    return {
      model: this.config.model,
      messages: allMessages,
      stream: true,
      temperature: this.config.temperature ?? 0.7,
      max_tokens: this.config.maxTokens ?? 2048,
    };
  }

  parseStreamChunk(chunk: string): string | null {
    try {
      const json = JSON.parse(chunk);
      return json.choices?.[0]?.delta?.content || null;
    } catch {
      return null;
    }
  }

  getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }
}