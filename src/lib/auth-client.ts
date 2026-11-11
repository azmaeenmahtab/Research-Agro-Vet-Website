import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';
import type { BetterAuthClientPlugin } from 'better-auth';

const TOKEN_STORAGE_KEY = 'better-auth_token';

/**
 * Extracts active bearer token from localStorage or cookies
 */
export function getStoredBearerToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Helper to extract clean token if it's signed (e.g. s:token.signature or token.signature)
  const cleanTokenString = (raw: string): string => {
    let val = raw.trim();
    if (val.startsWith('s:')) val = val.slice(2);
    if (val.includes('.')) val = val.split('.')[0];
    return val;
  };

  // 1. Check local storage for token captured via `set-auth-token` header
  try {
    const localToken =
      localStorage.getItem(TOKEN_STORAGE_KEY) ||
      localStorage.getItem('better-auth.session_token');
    if (localToken) return cleanTokenString(localToken);
  } catch (e) {
    // localStorage might be unavailable in restricted contexts
  }

  // 2. Fallback: Parse session cookie set by Better Auth
  try {
    const match = document.cookie.match(
      /(?:^|;\s*)(?:__Secure-)?better-auth\.session_token=([^;]+)/
    );
    if (match && match[1]) {
      return cleanTokenString(decodeURIComponent(match[1]));
    }
  } catch (e) {
    // ignore
  }

  return null;
}

/**
 * Bearer client plugin that:
 * 1. Listens for `set-auth-token` response headers from Better Auth and stores them.
 * 2. Exposes `getBearerToken()` via client and `getActions().getBearerToken()`.
 */
export const bearerClientPlugin = (): BetterAuthClientPlugin => ({
  id: 'bearer',
  fetchPlugins: [
    {
      id: 'bearer-token-listener',
      name: 'bearer-token-listener',
      hooks: {
        onResponse(context) {
          try {
            const token = context.response?.headers?.get('set-auth-token');
            if (token && typeof window !== 'undefined') {
              localStorage.setItem(TOKEN_STORAGE_KEY, token);
            }
          } catch (e) {
            // ignore
          }
        },
      },
    },
  ],
  getActions: () => ({
    getBearerToken: () => getStoredBearerToken(),
  }),
});

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL;
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [
    adminClient(),
    bearerClientPlugin(),
  ],
});

// Ensure both authClient.getActions().getBearerToken() and authClient.getBearerToken() work seamlessly
(authClient as any).getActions = () => ({
  getBearerToken: getStoredBearerToken,
});
(authClient as any).getBearerToken = getStoredBearerToken;

export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = authClient;
