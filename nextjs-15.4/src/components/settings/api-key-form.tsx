'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Copy, Check } from 'lucide-react';
import { generateApiKeyAction } from '@/lib/actions/apikeys';

export function ApiKeyForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsGenerating(true);
    setError(null);
    
    const result = await generateApiKeyAction(formData);
    
    if (result.error) {
      setError(result.error);
    } else if (result.success && result.apiKey) {
      setNewApiKey(result.apiKey);
    }
    
    setIsGenerating(false);
  }

  function handleCopy() {
    if (newApiKey) {
      navigator.clipboard.writeText(newApiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleClose() {
    setNewApiKey(null);
    setError(null);
  }

  if (newApiKey) {
    return (
      <div className="border-2 border-green-200 bg-green-50 rounded-lg p-6">
        <div className="text-center">
          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <h4 className="font-medium text-green-900">API Key Generated!</h4>
          <p className="text-sm text-green-700 mb-4">
            Copy your API key now. You won&apos;t be able to see it again.
          </p>
          <div className="bg-white border rounded-lg p-3 mb-4">
            <code className="text-sm font-mono break-all text-gray-800">
              {newApiKey}
            </code>
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleCopy} variant="outline" size="sm">
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Key
                </>
              )}
            </Button>
            <Button onClick={handleClose} size="sm">
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-muted rounded-lg p-6">
      <form action={handleSubmit} className="text-center">
        <h4 className="font-medium">Create New API Key</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Generate a new API key for your applications
        </p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-4">
            {error}
          </div>
        )}
        <div className="max-w-sm mx-auto space-y-3">
          <Input 
            name="name" 
            placeholder="API Key Name (e.g., Mobile App)" 
            required 
            disabled={isGenerating}
          />
          <Button type="submit" className="w-full" disabled={isGenerating}>
            <Plus className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate API Key'}
          </Button>
        </div>
      </form>
    </div>
  );
}