import type { SiteContent } from "../data";

/* Frontend API client.
   Set VITE_API_URL to your deployed backend (e.g. http://localhost:5000) and the
   site switches from localStorage mode to live backend mode automatically.
   When the variable is empty, everything runs on localStorage exactly as before. */

const API_URL: string = (
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL ?? ""
).replace(/\/+$/, "");

export const apiEnabled = API_URL.length > 0;

const TOKEN_KEY = "ma_api_token";

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) => {
  if (t) sessionStorage.setItem(TOKEN_KEY, t);
  else sessionStorage.removeItem(TOKEN_KEY);
};

class ApiError extends Error {}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined && !(body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Could not reach the server.");
  }
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new ApiError((data.error as string) || `Request failed (${res.status})`);
  return data as T;
}

export const api = {
  auth: {
    login: (password: string) =>
      request<{ token: string; email: string }>("/api/auth/login", {
        method: "POST",
        body: { password },
      }),
    requestOtp: (email: string) =>
      request<{ ok: boolean }>("/api/auth/otp", { method: "POST", body: { email } }),
    verifyOtp: (email: string, otp: string) =>
      request<{ ok: boolean }>("/api/auth/verify-otp", { method: "POST", body: { email, otp } }),
    resetPassword: (email: string, otp: string, newPassword: string) =>
      request<{ ok: boolean }>("/api/auth/reset", {
        method: "POST",
        body: { email, otp, newPassword },
      }),
    changePassword: (currentPassword: string, otp: string, newPassword: string) =>
      request<{ ok: boolean }>("/api/auth/password", {
        method: "POST",
        auth: true,
        body: { currentPassword, otp, newPassword },
      }),
  },
  content: {
    fetchPublic: () => request<{ content: SiteContent; empty: boolean }>("/api/content"),
    fetchFull: () =>
      request<{ content: SiteContent; empty: boolean }>("/api/content/full", { auth: true }),
    push: (content: SiteContent) =>
      request<{ ok: boolean }>("/api/content", { method: "PUT", auth: true, body: { content } }),
  },
  messages: {
    send: (m: { name: string; email: string; subject: string; message: string }) =>
      request<{ ok: boolean }>("/api/contact", { method: "POST", body: m }),
  },
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<{ url: string }>("/api/upload", { method: "POST", auth: true, body: form });
  },
};
