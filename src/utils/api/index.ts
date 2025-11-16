// /src/utils/api/index.ts

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string | number, any> | URLSearchParams;
  body?: any;
  timeoutMs?: number;
  token?: string | (() => string | undefined | null);
  // If true, caller expects raw Response object
  rawResponse?: boolean;
}

export class ApiError extends Error {
  status: number;
  data: any | null;

  constructor(message: string, status: number, data: any | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const url = `http://localhost:8080/api/${path}`;

  if (!params) return url;
  const search =
    params instanceof URLSearchParams
      ? params.toString()
      : Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) =>
            Array.isArray(v)
              ? v
                  .map(
                    (i) =>
                      `${encodeURIComponent(k)}=${encodeURIComponent(
                        String(i)
                      )}`
                  )
                  .join("&")
              : `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
          )
          .join("&");

  return search ? `${url}${url.includes("?") ? "&" : "?"}${search}` : url;
}

function parseJsonSafe(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getToken(): string | undefined | null {
  if (typeof sessionStorage !== "undefined") {
    return sessionStorage.getItem("token");
  }
  return undefined;
}

export function createApi() {
  async function request<T = any>(
    path: string,
    opts: RequestOptions = {}
  ): Promise<T> {
    const {
      method,
      headers = {},
      params,
      body,
      timeoutMs = 0,
      token = getToken(),
      rawResponse = false,
    } = opts;

    const url = buildUrl(path, params);

    const finalHeaders: Record<string, string> = { ...headers };
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;
    if (!isFormData && body != null && !finalHeaders["Content-Type"]) {
      finalHeaders["Content-Type"] = "application/json";
    }

    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (timeoutMs > 0) {
      timer = setTimeout(() => controller.abort(), timeoutMs);
    }

    const init: RequestInit = {
      method,
      headers: finalHeaders,
      signal: controller.signal,
    };

    if (body != null) {
      init.body = isFormData ? body : JSON.stringify(body);
    }

    let res: Response;
    try {
      res = await fetch(url, init);


      console.log(res);


    } catch (err: any) {
      if (err?.name === "AbortError")
        throw new ApiError("Request timed out", 0, null);
      throw new ApiError(err?.message || "Network error", 0, null);
    } finally {
      if (timer) clearTimeout(timer);
    }

    if (rawResponse) return res as unknown as T;

    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();
    const data = contentType.includes("application/json")
      ? parseJsonSafe(text)
      : text;

    if (!res.ok) {
      throw new ApiError(
        res.statusText || "Request failed",
        res.status,
        data || null
      );
    }

    // No content
    if (res.status === 204) return undefined as unknown as T;

    return data as T;
  }

  return {
    request,
    get<T = any>(path: string, opts?: Omit<RequestOptions, "method" | "body">) {
      return request<T>(path, { ...(opts || {}), method: "GET" });
    },
    post<T = any>(
      path: string,
      body?: any,
      opts?: Omit<RequestOptions, "method" | "body">
    ) {
      return request<T>(path, { ...(opts || {}), method: "POST", body });
    },
    put<T = any>(
      path: string,
      body?: any,
      opts?: Omit<RequestOptions, "method" | "body">
    ) {
      return request<T>(path, { ...(opts || {}), method: "PUT", body });
    },
    del<T = any>(path: string, opts?: Omit<RequestOptions, "method" | "body">) {
      return request<T>(path, { ...(opts || {}), method: "DELETE" });
    },
  };
}

export const api = createApi();

export default api;
