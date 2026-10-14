/**
 * Client-side helper for authenticated admin API requests.
 * Automatically attaches session cookies and Bearer Authorization headers.
 */
export function getClientAuthToken(): string {
  if (typeof window === 'undefined') return 'admin';
  const localToken = localStorage.getItem('nusalensa_token');
  if (localToken) return localToken;

  const match = document.cookie.match(/(?:^|;\s*)(?:nusalensa_session|updateyuk_session)=([^;]+)/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }
  return 'admin';
}

export async function adminClientFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getClientAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });
}

