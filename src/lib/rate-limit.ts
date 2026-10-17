import { env, rateLimitProvider } from "./env";

/**
 * Rate limiting with a two-tier strategy:
 *  1. Upstash Redis (distributed — correct for multi-instance production).
 *  2. A process-local fixed-window limiter for development / single instance.
 *
 * The limiter never fails closed on infrastructure trouble: if Upstash throws we
 * fall through to the in-process limiter rather than 500-ing every request.
 */

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

type Tier = { limit: number; windowSec: number };

export const RL_TIERS = {
  auth: { limit: 8, windowSec: 60 },
  write: { limit: 40, windowSec: 60 },
  read: { limit: 120, windowSec: 60 },
  upload: { limit: 10, windowSec: 60 }
} as const satisfies Record<string, Tier>;

export type TierName = keyof typeof RL_TIERS;

// ── In-memory fixed-window store ────────────────────────────────────────────
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Periodic sweep so a long-lived process does not leak bucket keys.
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
  }, 60_000);
  if (typeof timer === "object" && "unref" in timer) timer.unref();
}

function memoryLimit(name: string, tier: Tier, identifier: string): RateLimitResult {
  const key = `${name}:${identifier}`;
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + tier.windowSec * 1000 };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  const remaining = Math.max(0, tier.limit - bucket.count);

  return {
    success: bucket.count <= tier.limit,
    limit: tier.limit,
    remaining,
    reset: bucket.resetAt
  };
}

// ── Upstash sliding window ──────────────────────────────────────────────────
type UpstashLimiters = Record<string, { limit: (key: string) => Promise<{ success: boolean; remaining: number; reset: number }> }>;
let upstash: UpstashLimiters | null = null;

async function upstashLimiters(): Promise<UpstashLimiters> {
  if (upstash) return upstash;
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL as string,
    token: env.UPSTASH_REDIS_REST_TOKEN as string
  });

  const built: UpstashLimiters = {};
  for (const [name, tier] of Object.entries(RL_TIERS)) {
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(tier.limit, `${tier.windowSec} s`),
      analytics: true,
      prefix: `uavlabs:${name}`
    });
    built[name] = {
      limit: async (key: string) => {
        const res = await ratelimit.limit(key);
        return { success: res.success, remaining: res.remaining, reset: res.reset };
      }
    };
  }
  upstash = built;
  return upstash;
}

export async function checkRateLimit(name: TierName, identifier: string): Promise<RateLimitResult> {
  const tier: Tier = RL_TIERS[name] ?? RL_TIERS.read;

  if (rateLimitProvider === "upstash") {
    try {
      const limiters = await upstashLimiters();
      const res = await limiters[name].limit(identifier);
      return {
        success: res.success,
        limit: tier.limit,
        remaining: Math.max(0, res.remaining),
        reset: res.reset
      };
    } catch (error) {
      console.warn("[rate-limit] Upstash unavailable — using in-memory fallback:", error);
    }
  }

  return memoryLimit(name, tier, identifier);
}

/** Best-effort client identifier: proxy headers first, then a coarse fallback. */
export function clientIdentifier(req: Request, userId?: string | null): string {
  if (userId) return `user:${userId}`;
  const h = req.headers;
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    "unknown";
  return `ip:${ip}`;
}
