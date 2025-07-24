import { LLMConfig, LLMMessage } from '../types';

export abstract class BaseLLMProvider {
  protected config: LLMConfig;
  protected apiKey: string;
  protected baseUrl: string;

  constructor(config: LLMConfig, apiKey: string, baseUrl: string) {
    this.config = config;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  abstract createRequestBody(messages: LLMMessage[], systemPrompt?: string): any;
  abstract parseStreamChunk(chunk: string): string | null;
  abstract getHeaders(): HeadersInit;

  async *streamChat(messages: LLMMessage[], systemPrompt?: string): AsyncGenerator<string> {
    const headers = this.getHeaders();
    const body = this.createRequestBody(messages, systemPrompt);

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LLM API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            const content = this.parseStreamChunk(data);
            if (content) {
              yield content;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}