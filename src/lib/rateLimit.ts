/**
 * Cybersecurity Rate Limiter & Brute-Force Protection
 * In-memory sliding window store with IP & Identifier tracking.
 * Safe for serverless & Node runtime environments.
 */

interface RateLimitRecord {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  blockedUntil?: number;
}

// Separate stores for different security scopes
const loginFailureStore = new Map<string, RateLimitRecord>();
const generalAuthStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 10 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of loginFailureStore.entries()) {
      if (record.blockedUntil && record.blockedUntil < now && now - record.lastAttempt > 3600000) {
        loginFailureStore.delete(key);
      }
    }
    for (const [key, record] of generalAuthStore.entries()) {
      if (now - record.lastAttempt > 600000) {
        generalAuthStore.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

/**
 * Extract client IP address from request headers
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Check if an IP or identifier is currently locked out due to brute force attempts
 * Max 5 failures within 10 minutes -> 15 minutes lockout
 */
export function checkLoginLockout(identifier: string): { isLocked: boolean; waitMinutes: number } {
  const now = Date.now();
  const record = loginFailureStore.get(identifier);

  if (!record) {
    return { isLocked: false, waitMinutes: 0 };
  }

  if (record.blockedUntil && record.blockedUntil > now) {
    const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    const waitMinutes = Math.ceil(remainingSeconds / 60);
    return { isLocked: true, waitMinutes };
  }

  // Lockout expired, reset if window has passed
  if (record.blockedUntil && record.blockedUntil <= now) {
    loginFailureStore.delete(identifier);
    return { isLocked: false, waitMinutes: 0 };
  }

  return { isLocked: false, waitMinutes: 0 };
}

/**
 * Record a failed login attempt
 */
export function recordFailedLogin(identifier: string): { attemptsLeft: number; isLocked: boolean; waitMinutes: number } {
  const now = Date.now();
  const MAX_ATTEMPTS = 5;
  const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
  const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

  let record = loginFailureStore.get(identifier);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    record = {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    };
    loginFailureStore.set(identifier, record);
    return { attemptsLeft: MAX_ATTEMPTS - 1, isLocked: false, waitMinutes: 0 };
  }

  record.count += 1;
  record.lastAttempt = now;

  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = now + LOCKOUT_MS;
    return { attemptsLeft: 0, isLocked: true, waitMinutes: 15 };
  }

  loginFailureStore.set(identifier, record);
  return { attemptsLeft: MAX_ATTEMPTS - record.count, isLocked: false, waitMinutes: 0 };
}

/**
 * Clear failures upon successful authentication
 */
export function clearFailedLogin(identifier: string): void {
  loginFailureStore.delete(identifier);
}

/**
 * Generic Rate Limiter for API endpoints
 */
export function checkRateLimit(key: string, maxRequests = 20, windowMs = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let record = generalAuthStore.get(key);

  if (!record || now - record.firstAttempt > windowMs) {
    record = {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    };
    generalAuthStore.set(key, record);
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  record.lastAttempt = now;
  generalAuthStore.set(key, record);

  return { allowed: true, remaining: maxRequests - record.count };
}
