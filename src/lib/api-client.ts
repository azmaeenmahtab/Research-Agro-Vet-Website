import { getStoredBearerToken, authClient } from './auth-client';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

/**
 * Returns full URL pointing to either Express API or internal Next.js route
 */
export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // In the browser: if we are running on any domain other than localhost (e.g. researchagrovet.com),
  // always use relative paths so requests stay on the live Next.js server over HTTPS.
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalhost) {
      return normalizedPath;
    }
  }

  if (!API_BASE_URL) {
    return normalizedPath;
  }
  return `${API_BASE_URL}${normalizedPath}`;
}

export class AuthError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Authorized fetch utility that dynamically resolves the active Better Auth token
 * and injects it as: `Authorization: Bearer <token>`
 */
export async function authorizedFetch(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = getApiUrl(path);
  const headers = new Headers(options?.headers);

  // 1. Dynamically extract the token from Better Auth client storage
  const token =
    (authClient as any)?.getActions?.()?.getBearerToken?.() ||
    getStoredBearerToken();

  // 2. Inject Authorization: Bearer <token> header
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // 3. Set Content-Type: application/json if not multipart FormData
  if (!headers.has('Content-Type') && !(options?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}

/**
 * High-level typed API client that automatically uses authorizedFetch
 * and handles parsing and error propagation
 */
export async function apiClient<T = any>(
  path: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const response = await authorizedFetch(path, options);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.warn(`[API Auth Guard]: ${response.status} ${path}`, data);
      }

      return {
        data,
        error: data?.message || `Request failed with status ${response.status}`,
        status: response.status,
      };
    }

    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (err: any) {
    return {
      data: null,
      error: err.message || 'Network error occurred',
      status: 0,
    };
  }
}

export default apiClient;
