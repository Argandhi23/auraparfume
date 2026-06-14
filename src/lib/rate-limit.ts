// In-memory rate limiter (suitable for MVP)
const attempts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const record = attempts.get(key);
  
  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }
  
  if (record.count >= maxAttempts) {
    return false; // blocked
  }
  
  record.count++;
  return true; // allowed;
}
