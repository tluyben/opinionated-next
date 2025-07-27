'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Copy, Check } from 'lucide-react';
import { generateApiKeyAction } from '@/lib/actions/apikeys';

export function ApiKeyForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Create API Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {newApiKey ? 'API Key Generated!' : 'Create New API Key'}
          </DialogTitle>
          <DialogDescription>
            {newApiKey 
              ? 'Copy your API key now. You won\'t be able to see it again.'
              : 'Generate a new API key for secure access to your applications.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {newApiKey ? (
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-3">
              <code className="text-sm font-mono break-all">
                {newApiKey}
              </code>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" className="flex-1">
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
              <Button onClick={handleClose} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
            <Input 
              name="name" 
              placeholder="API Key Name (e.g., Mobile App)" 
              required 
              disabled={isGenerating}
            />
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isGenerating}>
                <Plus className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}