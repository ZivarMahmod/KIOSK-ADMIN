/**
 * Cache utility stubs
 * No-op implementations — Redis/Upstash cache is not configured.
 */

export async function getCache<T>(_key: string): Promise<T | null> {
  return null;
}

export async function setCache(
  _key: string,
  _value: unknown,
  _ttlSeconds?: number,
): Promise<void> {
  // no-op
}

export async function deleteCache(_key: string): Promise<void> {
  // no-op
}

export interface RateLimitResult {
  success: boolean;
  allowed: boolean;
  remaining: number;
  reset: number;
  current: number;
}

export async function checkRateLimit(
  _options: string | { limit?: number; window?: number; identifier?: string },
): Promise<RateLimitResult & { current: number }> {
  return { success: true, allowed: true, remaining: 999, reset: 0, current: 0 };
}

export const cacheKeys = {
  dashboard: {
    overview: (userId: string) => `dashboard:overview:${userId}`,
  },
  rateLimit: {
    key: (identifier: string) => `rate-limit:${identifier}`,
  },
};
