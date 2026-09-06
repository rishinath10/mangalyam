/**
 * In-process fixed-window rate limiter.
 *
 * The RSVP endpoint is the only public-write surface in the app (CLAUDE.md
 * rule #4), so it needs a brake. Redis is deliberately out of scope for V1,
 * and a per-process counter is genuinely enough here: this deploys as a single
 * Node container on Coolify, and the threat is a bored guest or a crawler
 * hammering one invitation, not a distributed flood.
 *
 * If this ever runs on more than one instance the limit becomes per-instance —
 * that is the moment to introduce Redis, not before.
 */
type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();
let lastSweep = Date.now();

/** Drop expired windows occasionally so the map cannot grow without bound. */
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, w] of buckets) {
    if (w.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  current.count += 1;
  const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
  return {
    ok: current.count <= limit,
    remaining: Math.max(0, limit - current.count),
    retryAfterSeconds,
  };
}

/**
 * Best-effort client address. Behind Coolify's proxy the socket address is the
 * proxy, so the forwarded header is the only signal available — it is
 * spoofable, which is exactly why this limiter is a brake and not a security
 * control.
 */
export function clientKey(req: Request, scope: string): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}
