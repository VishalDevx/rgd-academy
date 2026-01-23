import { Redis } from "@upstash/redis";

const WINDOW_SECONDS = 10 * 60; // 10 minutes
const MAX_ATTEMPTS = 5;

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return Redis.fromEnv();
}

function normalizeIdentifier(identifier: string) {
  return identifier.toLowerCase().trim();
}

type HeaderRecord = Record<string, string | string[] | undefined>;
type RequestWithHeaders = { headers?: Headers | HeaderRecord };

function ipFromRequest(req: RequestWithHeaders | undefined) {
  if (!req) return "unknown";
  const headers = req.headers;
  const get = (key: string) => {
    if (!headers) return undefined;
    if (headers instanceof Headers) return headers.get(key) ?? undefined;
    const v = headers[key] ?? headers[key.toLowerCase()] ?? headers[key.toUpperCase()];
    return Array.isArray(v) ? v[0] : v;
  };

  const xf = get("x-forwarded-for")?.split(",")[0]?.trim();
  const xr = get("x-real-ip")?.trim();
  return xf || xr || "unknown";
}

function failKey(ip: string, identifier: string) {
  return `rl:login:fail:${normalizeIdentifier(identifier)}:${ip}`;
}

function blockKey(ip: string, identifier: string) {
  return `rl:login:block:${normalizeIdentifier(identifier)}:${ip}`;
}

function backoffSeconds(attempts: number) {
  // attempts 6 => 60s, 7 => 120s, 8 => 240s, ... capped at window
  const exponent = Math.max(0, attempts - (MAX_ATTEMPTS + 1));
  return Math.min(WINDOW_SECONDS, 60 * 2 ** exponent);
}

export async function isLoginBlocked(opts: { req?: RequestWithHeaders; identifier: string }) {
  const redis = getRedis();
  if (!redis) return { blocked: false, retryAfterSeconds: 0 };

  const ip = ipFromRequest(opts.req);
  const bKey = blockKey(ip, opts.identifier);

  const ttl = await redis.ttl(bKey);
  if (typeof ttl === "number" && ttl > 0) {
    return { blocked: true, retryAfterSeconds: ttl };
  }

  return { blocked: false, retryAfterSeconds: 0 };
}

export async function recordLoginFailure(opts: { req?: RequestWithHeaders; identifier: string }) {
  const redis = getRedis();
  if (!redis) return { blocked: false, retryAfterSeconds: 0, attempts: 0 };

  const ip = ipFromRequest(opts.req);
  const fKey = failKey(ip, opts.identifier);
  const bKey = blockKey(ip, opts.identifier);

  const attempts = await redis.incr(fKey);
  if (attempts === 1) {
    await redis.expire(fKey, WINDOW_SECONDS);
  }

  if (attempts > MAX_ATTEMPTS) {
    const ttl = backoffSeconds(attempts);
    // Always reset the block window based on newest attempt.
    await redis.set(bKey, "1", { ex: ttl });
    return { blocked: true, retryAfterSeconds: ttl, attempts };
  }

  return { blocked: false, retryAfterSeconds: 0, attempts };
}

export async function clearLoginFailures(opts: { req?: RequestWithHeaders; identifier: string }) {
  const redis = getRedis();
  if (!redis) return;

  const ip = ipFromRequest(opts.req);
  await redis.del(failKey(ip, opts.identifier), blockKey(ip, opts.identifier));
}

