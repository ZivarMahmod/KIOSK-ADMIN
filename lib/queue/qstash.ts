/**
 * QStash queue stub
 * No-op — QStash is not configured.
 */

export function isQStashConfigured(): boolean {
  return false;
}

export function getQStash(): { publishJSON: (options: Record<string, unknown>) => Promise<void> } | null {
  return null;
}

export async function publishToQueue(
  ..._args: unknown[]
): Promise<void> {
  // no-op
}

export async function queueEmail(
  ..._args: unknown[]
): Promise<void> {
  // no-op
}
