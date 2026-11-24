import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { ApiResponse } from "./types";

const BASE_URL = process.env.BACKEND_API_URL;

export const ACCESS_COOKIE = "accessToken";
export const REFRESH_COOKIE = "refreshToken";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const accessCookieOptions = { ...cookieOptions, maxAge: 60 * 60 * 24 }; // 1 day
export const refreshCookieOptions = { ...cookieOptions, maxAge: 60 * 60 * 24 * 7 }; // 7 days

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Attach the access token. Default: true */
  auth?: boolean;
  query?: Record<string, string | undefined>;
};

function buildUrl(path: string, query?: ApiOptions["query"]) {
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

async function parse<T>(res: Response): Promise<ApiResponse<T>> {
  try {
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return {
      success: false,
      statusCode: res.status,
      message: res.statusText || "Invalid response from server",
      data: null as T,
    };
  }
}

/**
 * POST /api/auth/refresh-token
 * Backend reads the refresh token from `req.cookies.refreshToken`,
 * so it has to be forwarded as a Cookie header from the server.
 */
export async function refreshAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  try {
    const res = await fetch(buildUrl("/api/auth/refresh-token"), {
      method: "POST",
      headers: { Cookie: `${REFRESH_COOKIE}=${refreshToken}` },
      cache: "no-store",
    });
    const result = await parse<{ accessToken: string }>(res);
    const accessToken = result.success ? result.data?.accessToken : null;
    if (!accessToken) return null;

    // Cookies can only be written from a Server Action / Route Handler.
    // While rendering a Server Component this throws — the fresh token is
    // still used for the retried request, so we ignore that case.
    try {
      cookieStore.set(ACCESS_COOKIE, accessToken, accessCookieOptions);
    } catch {}

    return accessToken;
  } catch {
    return null;
  }
}

/**
 * Single entry point for every backend call. Server-side only, so tokens
 * stay in httpOnly cookies and never reach the browser.
 * On a 401 it refreshes the access token once and retries.
 */
export async function api<T>(path: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
  const { method = "GET", body, auth = true, query } = options;

  const send = (token?: string) =>
    fetch(buildUrl(path, query), {
      method,
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

  // Every backend call is request-time data (no-store). Mark it so prerendering
  // stops here instead of starting a fetch that gets aborted.
  await connection();

  try {
    let token: string | undefined;
    if (auth) {
      token = (await cookies()).get(ACCESS_COOKIE)?.value;
    }

    let res = await send(token);

    if (auth && res.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) res = await send(newToken);
    }

    return await parse<T>(res);
  } catch (error) {
    console.error(`API ${method} ${path} failed:`, error);
    return {
      success: false,
      statusCode: 503,
      message: "Cannot reach the server. Please try again later.",
      data: null as T,
    };
  }
}
