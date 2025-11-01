import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      if (u?.id) headers['x-user-id'] = u.id;
    }
  } catch (e) {
    // ignore JSON parse errors
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.id) headers['x-user-id'] = u.id;
      }
    } catch (e) {}

    // Build URL: support queryKey being [baseUrl, paramsObject]
    const buildUrl = (qk: unknown[]) => {
      if (!qk || qk.length === 0) return "";
      const base = String(qk[0] ?? "");
      // if there's a single params object as second item, convert to query string
      if (qk.length >= 2 && typeof qk[1] === "object" && qk[1] !== null && !Array.isArray(qk[1])) {
        const paramsObj = qk[1] as Record<string, any>;
        const search = new URLSearchParams();
        Object.entries(paramsObj).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (Array.isArray(v)) {
            v.forEach((item) => search.append(k, String(item)));
          } else if (typeof v === "object") {
            // fallback: JSON stringify complex values
            search.append(k, JSON.stringify(v));
          } else {
            search.append(k, String(v));
          }
        });
        const qs = search.toString();
        return qs ? `${base}?${qs}` : base;
      }
      // fallback: join everything as path segments
      return qk.map((p) => String(p)).join("/");
    };

    const url = buildUrl(queryKey as unknown[]);

    const res = await fetch(url, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
