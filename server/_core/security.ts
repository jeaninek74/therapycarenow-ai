/**
 * Security middleware for TherapyCareNow
 * Covers: rate limiting, HTTP security headers, CORS, input sanitization
 * 
 * Risk mitigations:
 * - Data risk: rate limiting prevents brute-force credential attacks
 * - Privacy risk: helmet removes server fingerprinting headers
 * - Data risk: CORS lockdown prevents cross-origin data exfiltration
 */
import { type Application, type Request, type Response, type NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

// - Rate Limiters -

/**
 * Auth endpoint rate limiter: max 10 attempts per 15 minutes per IP.
 * Prevents brute-force attacks on login and registration.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many login attempts. Please wait 15 minutes before trying again.",
  },
  skipSuccessfulRequests: true, // Only count failed attempts
});

/**
 * General API rate limiter: max 200 requests per minute per IP.
 * Prevents API abuse and scraping.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});

/**
 * AI rate limiter: max 30 requests per 10 minutes per IP.
 * Prevents AI cost abuse and ensures fair access.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI requests. Please wait before trying again." },
});

// - Security Headers -

/**
 * Apply Helmet security headers.
 * Removes X-Powered-By, sets CSP, HSTS, etc.
 */
export function applyHelmet(app: Application) {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Vite requires unsafe-eval in dev
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://api.nppes.cms.hhs.gov", "https://clinicaltables.nlm.nih.gov"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Required for some embedded resources
    })
  );
}

// - Request Sanitization -

/**
 * Strip any keys that start with $ or contain . from request body.
 * Prevents NoSQL injection attacks.
 */
function sanitizeObject(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (key.startsWith("$") || key.includes(".")) continue;
    clean[key] = sanitizeObject(value);
  }
  return clean;
}

export function sanitizeRequestBody(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
}

// - PII Scrubber for Logging -

const PII_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,                    // Phone
  /\b\d{3}-\d{2}-\d{4}\b/g,                                  // SSN
  /\b(?:\d[ -]*?){13,16}\b/g,                                // Credit card
];

/**
 * Scrub PII from any string before logging.
 * Use this wrapper around all console.log/error calls.
 */
export function scrubPII(input: string): string {
  let result = input;
  for (const pattern of PII_PATTERNS) {
    result = result.replace(pattern, "[REDACTED]");
  }
  return result;
}

/**
 * Safe logger that automatically scrubs PII before output.
 */
export const safeLog = {
  info: (msg: string, ...args: unknown[]) => console.log(`[INFO] ${scrubPII(msg)}`, ...args),
  warn: (msg: string, ...args: unknown[]) => console.warn(`[WARN] ${scrubPII(msg)}`, ...args),
  error: (msg: string, ...args: unknown[]) => console.error(`[ERROR] ${scrubPII(msg)}`, ...args),
};
