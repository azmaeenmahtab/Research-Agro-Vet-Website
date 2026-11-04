/**
 * API Client for Research Agro Vet
 *
 * If NEXT_PUBLIC_API_URL is configured (e.g. http://localhost:4000), requests will
 * be sent directly to the Express API server.
 * Otherwise, falls back to the current origin (Next.js internal route handlers).
 */

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) {
    return normalizedPath;
  }
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function apiClient<T = any>(
  path: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const url = getApiUrl(path);
    const headers = new Headers(options?.headers);

    if (!headers.has('Content-Type') && !(options?.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
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

