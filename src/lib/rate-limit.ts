import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

if (!redis && process.env.NODE_ENV === "production") {
  console.warn("UPSTASH_REDIS_REST_URL/TOKEN not set: rate limiting is disabled");
}

function createLimiter(prefix: string, tokens: number, window: Duration) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix: `ratelimit:${prefix}`,
  });
}

const limiters = {
  login: createLimiter("login", 5, "1 m"),
  register: createLimiter("register", 3, "1 h"),
  checkUsername: createLimiter("check-username", 30, "1 m"),
};

export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Returns a 429 response when the limit is hit, or null to continue.
// Without Upstash configured (e.g. local dev) every request is allowed.
export async function rateLimit(
  name: keyof typeof limiters,
  key: string
): Promise<NextResponse | null> {
  const limiter = limiters[name];
  if (!limiter) return null;

  try {
    const { success, reset } = await limiter.limit(key);
    if (success) return null;

    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  } catch (error) {
    // Fail open so a Redis outage doesn't lock everyone out
    console.error("Rate limit error:", error);
    return null;
  }
}
