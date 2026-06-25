const ACCESS_KEY = "eventflow_access";
const REFRESH_KEY = "eventflow_refresh";
const USER_KEY = "eventflow_user";

export function getStoredSession() {
  const user = localStorage.getItem(USER_KEY);
  return {
    access: localStorage.getItem(ACCESS_KEY),
    refresh: localStorage.getItem(REFRESH_KEY),
    user: user ? JSON.parse(user) : null,
  };
}

export function storeSession({ access, refresh, user }) {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

async function refreshAccessToken() {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) return null;

  const response = await fetch("/api/auth/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  localStorage.setItem(ACCESS_KEY, data.access);
  return data.access;
}

export async function apiRequest(path, options = {}, retry = true) {
  const access = localStorage.getItem(ACCESS_KEY);
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (access) {
    headers.set("Authorization", `Bearer ${access}`);
  }

  const response = await fetch(path, { ...options, headers });

  if (response.status === 401 && retry) {
    const newAccess = await refreshAccessToken();
    if (newAccess) return apiRequest(path, options, false);
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const values = data && typeof data === "object" ? Object.values(data).flat().join(" ") : "";
    throw new Error(data?.detail || data?.message || values || "Request failed.");
  }

  return data;
}

export function unpackList(payload) {
  if (Array.isArray(payload)) return payload;
  return payload?.results || [];
}
