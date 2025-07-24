'use server';

import { LLMClient, LLMProvider, LLMMessage } from '@/lib/llm';

export async function streamLLMChat(
  provider: LLMProvider,
  model: string,
  messages: LLMMessage[],
  systemPrompt?: string
) {
  try {
    // Create a TransformStream to handle the streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start streaming in the background
    (async () => {
      try {
        for await (const chunk of LLMClient.streamChat(provider, model, messages, systemPrompt)) {
          await writer.write(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
        }
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to stream LLM chat');
  }
}

export async function getAvailableLLMProviders() {
  return {
    providers: LLMClient.getAvailableProviders(),
    models: LLMClient.getAvailableProviders().reduce((acc, provider) => {
      acc[provider] = LLMClient.getProviderModels(provider);
      return acc;
    }, {} as Record<LLMProvider, string[]>)
  };
}