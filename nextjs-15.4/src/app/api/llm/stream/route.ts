import { NextRequest } from 'next/server';
import { LLMClient, LLMProvider, LLMMessage } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    const { provider, model, messages, systemPrompt } = await request.json();

    if (!provider || !model || !messages) {
      return new Response('Missing required parameters', { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start streaming in the background
    (async () => {
      try {
        for await (const chunk of LLMClient.streamChat(
          provider as LLMProvider,
          model,
          messages as LLMMessage[],
          systemPrompt
        )) {
          await writer.write(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
        }
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ 
              error: error instanceof Error ? error.message : 'Unknown error' 
            })}\n\n`
          )
        );
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
    console.error('Stream error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}