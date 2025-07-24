import { getAvailableLLMProviders } from '@/lib/actions/llm';
import { StreamingChat } from '@/components/llm/streaming-chat';

export default async function LLMDemoPage() {
  const { providers, models } = await getAvailableLLMProviders();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">LLM Chat Demo</h1>
        <p className="text-muted-foreground">
          Test the integrated LLM providers with streaming support
        </p>
      </div>

      <StreamingChat 
        availableProviders={providers}
        providerModels={models}
      />

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Configuration Status</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(['openai', 'anthropic', 'openrouter', 'groq', 'cerebras'] as const).map((provider) => (
            <div key={provider} className="rounded-lg border p-4">
              <h3 className="font-medium capitalize">{provider}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Status: {providers.includes(provider) ? (
                  <span className="text-green-600 dark:text-green-400">✓ Configured</span>
                ) : (
                  <span className="text-orange-600 dark:text-orange-400">Not configured</span>
                )}
              </p>
              {providers.includes(provider) && (
                <p className="text-xs text-muted-foreground mt-2">
                  {models[provider]?.length || 0} models available
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-lg border p-6 bg-muted/50">
        <h2 className="text-xl font-semibold mb-4">Quick Start Guide</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Add API keys to your <code className="px-1 py-0.5 bg-background rounded">.env</code> file</li>
          <li>Select a provider and model from the settings tab</li>
          <li>Optionally customize the system prompt</li>
          <li>Start chatting with the AI!</li>
        </ol>

        <div className="mt-4">
          <h3 className="font-medium mb-2">Required Environment Variables:</h3>
          <pre className="text-xs bg-background rounded p-3 overflow-x-auto">
{`# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# OpenRouter
OPENROUTER_API_KEY=sk-or-...

# Groq
GROQ_API_KEY=gsk_...

# Cerebras
CEREBRAS_API_KEY=csk-...`}
          </pre>
        </div>
      </div>
    </div>
  );
}