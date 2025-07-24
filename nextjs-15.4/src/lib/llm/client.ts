import { LLMProvider, LLMConfig, LLMMessage } from './types';
import { getConfiguredProviders } from './config';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { OpenRouterProvider } from './providers/openrouter';
import { GroqProvider } from './providers/groq';
import { CerebrasProvider } from './providers/cerebras';
import { BaseLLMProvider } from './providers/base';

export class LLMClient {
  private static providers = getConfiguredProviders();

  static getAvailableProviders(): LLMProvider[] {
    return Object.keys(this.providers) as LLMProvider[];
  }

  static getProviderModels(provider: LLMProvider): string[] {
    return this.providers[provider]?.models || [];
  }

  static isProviderConfigured(provider: LLMProvider): boolean {
    return !!this.providers[provider];
  }

  private static createProvider(config: LLMConfig): BaseLLMProvider {
    const providerConfig = this.providers[config.provider];
    if (!providerConfig) {
      throw new Error(`Provider ${config.provider} is not configured. Please add API key to environment variables.`);
    }

    const apiKey = config.apiKey || providerConfig.apiKey;
    const baseUrl = config.baseUrl || providerConfig.baseUrl;

    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(config, apiKey, baseUrl);
      case 'anthropic':
        return new AnthropicProvider(config, apiKey, baseUrl);
      case 'openrouter':
        return new OpenRouterProvider(config, apiKey, baseUrl);
      case 'groq':
        return new GroqProvider(config, apiKey, baseUrl);
      case 'cerebras':
        return new CerebrasProvider(config, apiKey, baseUrl);
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }

  static async *streamChat(
    provider: LLMProvider,
    model: string,
    messages: LLMMessage[],
    systemPrompt?: string,
    options?: Partial<LLMConfig>
  ): AsyncGenerator<string> {
    const config: LLMConfig = {
      provider,
      model,
      ...options
    };

    const llmProvider = this.createProvider(config);
    yield* llmProvider.streamChat(messages, systemPrompt);
  }

  static async chat(
    provider: LLMProvider,
    model: string,
    messages: LLMMessage[],
    systemPrompt?: string,
    options?: Partial<LLMConfig>
  ): Promise<string> {
    let result = '';
    for await (const chunk of this.streamChat(provider, model, messages, systemPrompt, options)) {
      result += chunk;
    }
    return result;
  }
}