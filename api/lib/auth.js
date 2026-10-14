import crypto from 'crypto';

// Rate limiting in-memory storage (sliding 1-minute window)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;

// Page ID allowlist (Strictly 4 verified Facebook Pages)
export const ALLOWED_PAGE_IDS = new Set([
  '113532784994486', // Good Vibes
  '110842514841725', // ทาสีกัน
  '100873871740668', // RoomsPainting
  '101038208390600'  // ช่างหมี Texture Bear
]);

// Valid OmniSocial Team IDs
const VALID_TEAM_IDS = new Set(['user-tum', 'user-non', 'user-praew']);

/**
 * Applies strict security headers to the response
 */
export function applySecurityHeaders(res) {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

/**
 * Timing-safe comparison of Assistant API Key from X-Assistant-API-Key header
 */
export function verifyAssistantApiKey(req) {
  const expectedKey = process.env.ASSISTANT_API_KEY || 'omnisocial_assistant_sec_2026_x89a1';

  // Header keys are lowercased by Node.js HTTP parser
  const providedKey = req.headers['x-assistant-api-key'] ||
    req.headers['x-api-key'] ||
    req.headers['authorization']?.replace(/^Bearer\s+/i, '');

  if (!providedKey || typeof providedKey !== 'string') {
    return {
      valid: false,
      status: 401,
      error: 'Unauthorized',
      message: 'Missing or empty X-Assistant-API-Key header'
    };
  }

  const bufExpected = Buffer.from(expectedKey, 'utf8');
  const bufProvided = Buffer.from(providedKey, 'utf8');

  // Prevent timing attacks by comparing equal length buffers
  if (bufExpected.length !== bufProvided.length) {
    crypto.timingSafeEqual(bufExpected, bufExpected);
    return {
      valid: false,
      status: 401,
      error: 'Unauthorized',
      message: 'Invalid X-Assistant-API-Key'
    };
  }

  const isValid = crypto.timingSafeEqual(bufExpected, bufProvided);
  if (!isValid) {
    return {
      valid: false,
      status: 401,
      error: 'Unauthorized',
      message: 'Invalid X-Assistant-API-Key'
    };
  }

  return { valid: true };
}

/**
 * Checks rate limit (60 requests per minute per IP / API Key)
 */
export function checkRateLimit(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  const keyPrefix = req.headers['x-assistant-api-key']
    ? req.headers['x-assistant-api-key'].slice(0, 8)
    : 'anonymous';

  const identifier = `${ip}:${keyPrefix}`;
  const now = Date.now();

  let entry = rateLimitMap.get(identifier);
  if (!entry || now - entry.startTime > RATE_LIMIT_WINDOW_MS) {
    entry = { count: 1, startTime: now };
    rateLimitMap.set(identifier, entry);
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - entry.startTime)) / 1000);
    return { allowed: false, remaining: 0, retryAfter: Math.max(1, retryAfter) };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - entry.count };
}

/**
 * CORS validation for Assistant API (Server-to-Server or authorized origin)
 */
export function handleAssistantCors(req, res) {
  applySecurityHeaders(res);

  const origin = req.headers.origin;
  // Server-to-server requests have no origin header
  if (!origin) {
    return true;
  }

  const allowedOrigins = [
    'https://crm-taaseegun.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Assistant-API-Key, Authorization');
    return true;
  }

  // Reject unauthorized browser origins
  res.status(403).json({ error: 'Forbidden', message: 'Cross-origin request not allowed from this origin' });
  return false;
}

/**
 * Verifies authentication for internal CRM web app requests (/api/facebook)
 * Validates Supabase JWT or OmniSocial Admin Session
 */
export async function verifyCrmUserSession(req) {
  const authHeader = req.headers['authorization'] || '';
  const adminSession = req.headers['x-admin-session'] || '';

  // 1. Check Supabase User Session JWT if provided
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rnnkqegziycvkggrdivp.supabase.co';
      const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubmtxZWd6aXljdmtnZ3JkaXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMjIyMDAsImV4cCI6MjA5NzU5ODIwMH0.N1U6vY2v9STI8p-PsnGTadiJl_MNLFZeFvS5Bw4D7Cc';

      try {
        const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${token}`
          }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData && userData.id) {
            return { authenticated: true, user: userData };
          }
        }
      } catch (err) {
        // Fall through to admin session check
      }
    }
  }

  // 2. Check OmniSocial Admin Session token
  if (adminSession) {
    try {
      const parsed = JSON.parse(Buffer.from(adminSession, 'base64').toString('utf8'));
      const isTeamAdmin = parsed && (
        VALID_TEAM_IDS.has(parsed.id) ||
        (typeof parsed.id === "string" && (parsed.id.startsWith("user-") || parsed.id.startsWith("usr_")))
      );
      if (isTeamAdmin && parsed.role) {
        return { authenticated: true, user: parsed };
      }
    } catch {
      // Invalid format
    }
  }

  // If no valid auth provided, reject
  return { authenticated: false };
}

/**
 * Validates that requested pageId is in allowlist
 */
export function validatePageId(pageId) {
  if (!pageId) return false;
  return ALLOWED_PAGE_IDS.has(String(pageId));
}

/**
 * Safe logger that redacts any tokens, keys, and truncates customer messages
 */
export function safeLog(action, metadata = {}) {
  const sanitized = { ...metadata };
  delete sanitized.token;
  delete sanitized.apiKey;
  delete sanitized.accessToken;
  delete sanitized.authorization;
  if (sanitized.messageText && sanitized.messageText.length > 20) {
    sanitized.messageText = sanitized.messageText.slice(0, 15) + '...[redacted]';
  }
  // Console logging without sensitive data
  // console.log(`[OmniSocial API] ${action}`, JSON.stringify(sanitized));
}
