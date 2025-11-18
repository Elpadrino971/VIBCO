// Middleware de sécurité renforcé pour Coding 2.0

import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate Limiter ultra-rapide en mémoire
const rateLimiter = new RateLimiterMemory({
  points: 10, // Nombre de requêtes
  duration: 1, // Par seconde
  blockDuration: 60, // Block pendant 60 secondes si dépassé
});

// Rate Limiter pour les API sensibles
const strictRateLimiter = new RateLimiterMemory({
  points: 3,
  duration: 60, // 3 requêtes par minute
  blockDuration: 600, // Block pendant 10 minutes
});

export async function securityMiddleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const pathname = request.nextUrl.pathname;

  try {
    // Rate limiting basé sur l'IP
    if (pathname.startsWith('/api/')) {
      // Endpoints sensibles (authentification, paiement)
      if (
        pathname.includes('/auth/') ||
        pathname.includes('/payment/') ||
        pathname.includes('/generate')
      ) {
        await strictRateLimiter.consume(ip);
      } else {
        // Autres endpoints
        await rateLimiter.consume(ip);
      }
    }

    // Headers de sécurité renforcés
    const headers = new Headers(request.headers);

    // Content Security Policy (CSP) strict
    headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.openai.com https://api.anthropic.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')
    );

    // Protection XSS
    headers.set('X-XSS-Protection', '1; mode=block');

    // Empêcher le MIME type sniffing
    headers.set('X-Content-Type-Options', 'nosniff');

    // Empêcher le clickjacking
    headers.set('X-Frame-Options', 'DENY');

    // Force HTTPS
    headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

    // Referrer policy
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy (anciennement Feature Policy)
    headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );

    // CSRF Token validation pour les mutations
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const csrfToken = request.headers.get('x-csrf-token');
      const sessionToken = request.cookies.get('session-token');

      if (!csrfToken || !sessionToken) {
        return NextResponse.json({ error: 'CSRF token missing' }, { status: 403 });
      }

      // Validation du token CSRF (implémentation simplifiée)
      // En production, utilisez une vraie validation cryptographique
      const expectedToken = generateCSRFToken(sessionToken.value);
      if (csrfToken !== expectedToken) {
        return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
      }
    }

    return NextResponse.next({ headers });
  } catch (error: any) {
    // Rate limit exceeded
    if (error.msBeforeNext) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter: Math.ceil(error.msBeforeNext / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(error.msBeforeNext / 1000)),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Date.now() + error.msBeforeNext),
          },
        }
      );
    }

    console.error('Security middleware error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Génération de token CSRF (simplifiée pour démo)
function generateCSRFToken(sessionToken: string): string {
  // En production, utilisez une vraie fonction cryptographique
  return Buffer.from(`${sessionToken}-csrf`).toString('base64');
}

// Validation des inputs (protection contre injections)
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Supprime < et >
    .replace(/javascript:/gi, '') // Supprime javascript:
    .replace(/on\w+=/gi, '') // Supprime les event handlers
    .trim();
}

// Validation des URLs
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Rate limiting par utilisateur (pour les utilisateurs authentifiés)
const userRateLimiter = new RateLimiterMemory({
  points: 100, // 100 requêtes
  duration: 3600, // Par heure
});

export async function rateLimitByUser(userId: string) {
  try {
    await userRateLimiter.consume(userId);
    return { allowed: true };
  } catch (error: any) {
    return {
      allowed: false,
      retryAfter: Math.ceil(error.msBeforeNext / 1000),
    };
  }
}

// Détection de patterns suspects
export function detectSuspiciousActivity(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
  ];

  // Autoriser les bots connus (Google, Bing, etc.)
  const allowedBots = /googlebot|bingbot|slackbot/i;
  if (allowedBots.test(userAgent)) {
    return false;
  }

  return suspiciousPatterns.some((pattern) => pattern.test(userAgent));
}

// Log d'activité suspecte
export async function logSuspiciousActivity(
  ip: string,
  pathname: string,
  reason: string
) {
  console.warn('🚨 Suspicious activity detected:', {
    ip,
    pathname,
    reason,
    timestamp: new Date().toISOString(),
  });

  // En production, envoyer à un service de monitoring (Sentry, Datadog, etc.)
  // await sendToMonitoring({ type: 'suspicious_activity', ip, pathname, reason });
}
