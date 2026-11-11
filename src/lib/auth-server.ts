import { prisma } from './prisma';
import { auth } from './auth';
import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers as nextHeaders } from 'next/headers';

/**
 * Server-side helper to verify that an incoming API request comes from an authenticated Administrator.
 * 
 * Supports:
 * 1. Native Better Auth session extraction via `auth.api.getSession`
 * 2. Authorization: Bearer <token> header (both raw and signed cookie strings)
 * 3. Cookie header and cookie store (both raw and signed with 's:' or '.')
 * 4. Administrator role verification (role === 'admin')
 */
export async function verifyAdminSession(request?: NextRequest) {
  try {
    // 1. First attempt: Better Auth native session verification
    let resolvedHeaders: Headers | undefined;
    try {
      if (request?.headers) {
        resolvedHeaders = request.headers;
      } else {
        const h = await nextHeaders();
        resolvedHeaders = h as unknown as Headers;
      }
    } catch {
      // ignore
    }

    if (resolvedHeaders) {
      try {
        const betterAuthSession = await auth.api.getSession({ headers: resolvedHeaders });
        if (betterAuthSession?.session && betterAuthSession?.user) {
          const role = (betterAuthSession.user as any).role?.toLowerCase();
          if (role === 'admin') {
            return {
              session: betterAuthSession.session,
              user: betterAuthSession.user,
            };
          }
        }
      } catch (err) {
        // Fall back to direct database verification below
      }
    }

    // 2. Second attempt: Direct DB lookup across all candidate tokens
    const rawCandidates: string[] = [];

    // From Authorization header
    const authHeader =
      request?.headers.get('authorization') ||
      request?.headers.get('Authorization') ||
      resolvedHeaders?.get('authorization') ||
      resolvedHeaders?.get('Authorization');

    if (authHeader) {
      const match = authHeader.match(/^bearer\s+(.+)$/i);
      rawCandidates.push(match ? match[1].trim() : authHeader.trim());
    }

    // Direct Cookie Header parsing (catches raw headers in proxy/node/fetch)
    const cookieHeader =
      request?.headers.get('cookie') ||
      resolvedHeaders?.get('cookie');

    if (cookieHeader) {
      const matches = cookieHeader.matchAll(
        /(?:better-auth\.session_token|__Secure-better-auth\.session_token|better-auth_token)=([^;]+)/gi
      );
      for (const m of matches) {
        if (m[1]) rawCandidates.push(m[1].trim());
      }
    }

    // From Next.js cookies API
    try {
      const cookieStore = await cookies();
      const cookieNames = [
        'better-auth.session_token',
        '__Secure-better-auth.session_token',
        'better-auth_token',
      ];

      for (const name of cookieNames) {
        const valFromReq = request?.cookies.get(name)?.value;
        if (valFromReq) rawCandidates.push(valFromReq);

        const valFromStore = cookieStore.get(name)?.value;
        if (valFromStore) rawCandidates.push(valFromStore);
      }
    } catch {
      // ignore
    }

    // Process and normalize candidates into clean tokens
    const tokenSet = new Set<string>();
    for (const raw of rawCandidates) {
      if (!raw) continue;
      const decoded = decodeURIComponent(raw).trim();
      tokenSet.add(decoded);

      let clean = decoded;
      // Strip "s:" prefix if signed cookie
      if (clean.startsWith('s:')) {
        clean = clean.slice(2);
      }
      tokenSet.add(clean);

      // Better Auth signed tokens have format: <token>.<signature>
      if (clean.includes('.')) {
        const baseToken = clean.split('.')[0];
        if (baseToken) tokenSet.add(baseToken);
      }
    }

    if (tokenSet.size === 0) {
      return null;
    }

    // Look up active session in Prisma database
    const session = await prisma.session.findFirst({
      where: {
        token: { in: Array.from(tokenSet) },
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!session || !session.user) {
      return null;
    }

    const role = (session.user as any).role?.toLowerCase();
    if (role !== 'admin') {
      return null;
    }

    return {
      session,
      user: session.user,
    };
  } catch (err) {
    console.error('Error verifying admin session in auth-server:', err);
    return null;
  }
}

/**
 * Standard unauthorized response helper for API routes.
 */
export function unauthorizedResponse(message = 'Unauthorized. Administrator privileges required.') {
  return NextResponse.json(
    { success: false, message },
    { status: 401 }
  );
}
