// Normalize API Base URL by removing trailing slash if present
const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const targetUrl = `${API_BASE_URL}${cleanEndpoint}`;

  let res: Response;
  try {
    res = await fetch(targetUrl, {
      ...options,
      headers,
    });
  } catch (networkErr: any) {
    throw new Error(
      `Unable to reach backend API at ${API_BASE_URL}. Ensure your server is running and CORS allows this origin. (${networkErr?.message || 'Network request failed'})`,
    );
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    let errorMsg = 'An unexpected error occurred';
    if (Array.isArray(body?.message)) {
      errorMsg = body.message.join(', ');
    } else if (body?.message) {
      errorMsg = body.message;
    } else if (body?.error) {
      errorMsg = body.error;
    }

    const err = new Error(errorMsg) as Error & {
      statusCode?: number;
      data?: any;
    };
    err.statusCode = res.status;
    err.data = body;
    throw err;
  }

  if (body && typeof body === 'object' && 'data' in body) {
    return body.data as T;
  }

  return body as T;
}
