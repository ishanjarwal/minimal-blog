/**
 * Lightweight, in-memory sliding window rate limiter designed for VPS deployments.
 * Operates without external Redis dependencies while protecting endpoints against brute force and abuse.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes to avoid memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      // Remove timestamps older than 10 minutes
      record.timestamps = record.timestamps.filter((ts) => now - ts < 10 * 60 * 1000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  if (timer.unref) {
    timer.unref();
  }
}

export interface RateLimitOptions {
  intervalMs?: number; // Time window (default: 60,000ms = 1 min)
  maxRequests?: number; // Max requests allowed per window (default: 30)
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const { intervalMs = 60 * 1000, maxRequests = 30 } = options;
  const now = Date.now();
  const windowStart = now - intervalMs;

  let record = rateLimitStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= maxRequests) {
    const oldestTimestamp = record.timestamps[0] || now;
    const reset = Math.ceil((oldestTimestamp + intervalMs - now) / 1000);
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: Math.max(1, reset),
    };
  }

  record.timestamps.push(now);

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.timestamps.length,
    reset: Math.ceil(intervalMs / 1000),
  };
}
