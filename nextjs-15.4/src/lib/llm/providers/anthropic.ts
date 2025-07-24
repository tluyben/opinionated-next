import { BaseLLMProvider } from './base';
import { LLMMessage } from '../types';

export class AnthropicProvider extends BaseLLMProvider {
  createRequestBody(messages: LLMMessage[], systemPrompt?: string) {
    // Anthropic uses a different format for system prompts
    const userMessages = messages.filter(m => m.role !== 'system');
    
    return {
      model: this.config.model,
      messages: userMessages,
      system: systemPrompt || messages.find(m => m.role === 'system')?.content,
      stream: true,
      temperature: this.config.temperature ?? 0.7,
      max_tokens: this.config.maxTokens ?? 2048,
    };
  }

  parseStreamChunk(chunk: string): string | null {
    try {
      const json = JSON.parse(chunk);
      if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
        return json.delta.text || null;
      }
      return null;
    } catch {
      return null;
    }
  }

  getHeaders(): HeadersInit {
    return {
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    };
  }

  async *streamChat(messages: LLMMessage[], systemPrompt?: string): AsyncGenerator<string> {
    const headers = this.getHeaders();
    const body = this.createRequestBody(messages, systemPrompt);

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
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