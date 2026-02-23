import axios from "axios";

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:8000/api";
const ACCESS_TOKEN_KEY = "access";
const REFRESH_TOKEN_KEY = "refresh";

// ─── Token Helpers ────────────────────────────────────────────────────────────

export const tokens = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setAccess: (token) => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  setRefresh: (token) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  setTokens: ({ access, refresh }) => {
    if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// ─── Axios Instance ───────────────────────────────────────────────────────────

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── Token Refresh Logic ──────────────────────────────────────────────────────

let isRefreshing = false;
// Queue of { resolve, reject } for requests that came in while refreshing
let refreshQueue = [];

const processQueue = (error, newAccessToken = null) => {
  refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(newAccessToken)
  );
  refreshQueue = [];
};

const refreshAccessToken = async () => {
  const refresh = tokens.getRefresh();
  if (!refresh) throw new Error("No refresh token available.");

  const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
    refresh,
  });

  const { access } = response.data;
  tokens.setAccess(access);
  return access;
};

// ─── Response Interceptor — auto-retry on 401 ─────────────────────────────────

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const is401 = error.response?.status === 401;
    const alreadyRetried = originalRequest._retry;
    const isRefreshEndpoint = originalRequest.url?.includes("token/refresh");

    if (is401 && !alreadyRetried && !isRefreshEndpoint) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Park this request until the ongoing refresh finishes
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return client(originalRequest);
          })
          .catch(Promise.reject);
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokens.clear();
        // Optional: redirect to login
        // window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Core Request Function ────────────────────────────────────────────────────

/**
 * Make an API request.
 *
 * @param {object}  options
 * @param {string}  options.method           - HTTP method: GET | POST | PUT | PATCH | DELETE
 * @param {string}  options.url              - Endpoint path, e.g. "/auth/login/"
 * @param {object}  [options.data]           - Request body (POST / PUT / PATCH)
 * @param {object}  [options.params]         - URL query parameters
 * @param {boolean} [options.auth=true]      - Attach Bearer token from localStorage
 * @param {object}  [options.headers]        - Additional headers to merge in
 * @param {object}  [options.axiosOptions]   - Any other axios config options
 * @returns {Promise<any>}                   - Resolves with response.data
 */
export const request = async ({
  method = "GET",
  url,
  data = null,
  params = null,
  auth = true,
  headers = {},
  axiosOptions = {},
}) => {
  const config = {
    method: method.toUpperCase(),
    url,
    ...axiosOptions,
  };

  if (data) config.data = data;
  if (params) config.params = params;

  // Merge headers
  config.headers = { ...headers };
  if (auth) {
    const token = tokens.getAccess();
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await client(config);
  return response.data;
};

// ─── Method Shortcuts ─────────────────────────────────────────────────────────

/**
 * Each shortcut accepts: (url, options?)
 * options mirrors the request() params (minus `method` and `url`).
 */

export const get = (url, options = {}) =>
  request({ method: "GET", url, ...options });

export const post = (url, data, options = {}) =>
  request({ method: "POST", url, data, ...options });

export const put = (url, data, options = {}) =>
  request({ method: "PUT", url, data, ...options });

export const patch = (url, data, options = {}) =>
  request({ method: "PATCH", url, data, ...options });

export const del = (url, options = {}) =>
  request({ method: "DELETE", url, ...options });

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const auth = {
  /**
   * Register a new user.
   * POST /auth/register/
   * Automatically stores returned tokens.
   */
  register: async (userData) => {
    const data = await post("/auth/register/", userData, { auth: false });
    tokens.setTokens(data);
    return data;
  },

  /**
   * Log in with credentials.
   * POST /auth/login/
   * Automatically stores returned tokens.
   */
  login: async (credentials) => {
    const data = await post("/auth/login/", credentials, { auth: false });
    tokens.setTokens(data);
    return data;
  },

  /**
   * Log out the current user.
   * POST /auth/logout/
   * Clears local tokens on success.
   */
  logout: async () => {
    const refresh = tokens.getRefresh();
    const data = await post("/auth/logout/", { refresh }, { auth: true });
    tokens.clear();
    return data;
  },

  /**
   * Manually refresh the access token.
   * POST /auth/token/refresh/
   */
  refreshToken: async () => {
    const newToken = await refreshAccessToken();
    return newToken;
  },
};

// ─── Usage Examples (remove in production) ───────────────────────────────────
//
// import { auth, get, post, patch, del, request } from "./api";
//
// // Register
// const { user, access, refresh } = await auth.register({
//   username: "alice", email: "alice@example.com", password: "secret",
// });
//
// // Login
// await auth.login({ username: "alice", password: "secret" });
//
// // Authenticated GET with query params
// const users = await get("/users/", { params: { page: 2 } });
//
// // Public GET (no token)
// const info = await get("/some-public-endpoint/", { auth: false });
//
// // POST with body
// await post("/some-resource/", { name: "example" });
//
// // PATCH
// await patch("/users/me/", { email: "new@email.com" });
//
// // DELETE
// await del("/users/42/");
//
// // Full control via request()
// const result = await request({
//   method: "POST",
//   url: "/users/me/change-password/",
//   data: { old_password: "old", new_password: "new" },
//   auth: true,
//   headers: { "X-Custom-Header": "value" },
//   axiosOptions: { timeout: 5000 },
// });
//
// // Logout
// await auth.logout();