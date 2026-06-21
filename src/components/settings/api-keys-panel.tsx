"use client";

import { useActionState, useTransition, useState } from "react";
import { Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createApiKeyAction, deleteApiKeyAction } from "@/lib/actions/settings";
import type { ActionResult } from "@/lib/types";
import type { ApiKey, CreatedApiKey } from "@/lib/data/settings";

interface ApiKeysPanelProps {
  apiKeys: ApiKey[];
}

export function ApiKeysPanel({ apiKeys: initial }: ApiKeysPanelProps) {
  const [keys, setKeys] = useState(initial);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deletePending, startDelete] = useTransition();

  const [state, action, isPending] = useActionState(
    async (prev: ActionResult<CreatedApiKey> | null, formData: FormData) => {
      const result = await createApiKeyAction(prev, formData);
      if (result.ok) {
        setNewKey(result.data.rawKey);
        setKeys((k) => [result.data.key, ...k]);
      }
      return result;
    },
    null,
  );

  function handleCopy() {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDelete(keyId: string) {
    setKeys((k) => k.filter((kk) => kk.id !== keyId));
    startDelete(async () => {
      await deleteApiKeyAction(keyId);
    });
  }

  return (
    <div className="space-y-4">
      {/* New key reveal */}
      {newKey && (
        <div className="rounded-md border border-green-300 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
          <p className="mb-1 text-xs font-medium text-green-800 dark:text-green-200">
            Copy this key now — it won&apos;t be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-white px-2 py-1 text-xs dark:bg-black">
              {newKey}
            </code>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
            </Button>
          </div>
        </div>
      )}

      {/* Existing keys */}
      {keys.length > 0 ? (
        <div className="rounded-lg border divide-y">
          {keys.map((k) => (
            <div key={k.id} className="flex items-center justify-between px-3 py-2">
              <div>
                <p className="text-sm font-medium">{k.name}</p>
                <p className="text-xs text-muted-foreground">
                  <code>{k.prefix}…</code>
                  {k.last_used && ` · last used ${new Date(k.last_used).toLocaleDateString()}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(k.id)}
                disabled={deletePending}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No API keys yet.</p>
      )}

      {/* Create form */}
      <form action={action} className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="key-name" className="text-xs">Key name</Label>
          <Input id="key-name" name="name" placeholder="e.g. My AI agent" required disabled={isPending} />
        </div>
        <Button type="submit" size="sm" disabled={isPending}>Create key</Button>
      </form>
      {state && !state.ok && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
    </div>
  );
}
