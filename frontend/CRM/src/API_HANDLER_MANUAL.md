# API Handler — Usage Manual

> Axios-based HTTP client for `localhost:8000/api/` with automatic JWT token refresh, auth helpers, and full HTTP method support.

---

## Table of Contents

1. [Installation & Setup](#1-installation--setup)
2. [Token Management](#2-token-management)
3. [Making Requests](#3-making-requests)
   - [Method Shortcuts](#method-shortcuts)
   - [Full `request()` Function](#full-request-function)
   - [Request Options Reference](#request-options-reference)
4. [Authentication](#4-authentication)
   - [Register](#register)
   - [Login](#login)
   - [Logout](#logout)
   - [Manual Token Refresh](#manual-token-refresh)
5. [Authenticated vs. Public Requests](#5-authenticated-vs-public-requests)
6. [Automatic Token Refresh](#6-automatic-token-refresh)
7. [Error Handling](#7-error-handling)
8. [Real-World Examples](#8-real-world-examples)

---

## 1. Installation & Setup

Install the required dependency:

```bash
npm install axios
```

Import the handler into your project:

```js
import { auth, get, post, put, patch, del, request, tokens } from "./api";
```

The base URL is pre-configured to `http://localhost:8000/api`. All endpoint paths you pass are appended to this base automatically.

---

## 2. Token Management

Tokens are stored in `localStorage` under two keys: `access_token` and `refresh_token`. The `tokens` utility lets you interact with them directly when needed.

```js
import { tokens } from "./api";

// Read tokens
tokens.getAccess();   // returns the current access token string, or null
tokens.getRefresh();  // returns the current refresh token string, or null

// Write tokens manually (e.g. if you receive them outside the auth helpers)
tokens.setAccess("eyJ...");
tokens.setRefresh("eyJ...");

// Store both at once (ignores missing keys)
tokens.setTokens({ access: "eyJ...", refresh: "eyJ..." });

// Clear both tokens (e.g. on logout or auth failure)
tokens.clear();
```

> **Note:** You rarely need to call these directly. `auth.login()`, `auth.register()`, and the automatic refresh interceptor all manage tokens for you.

---

## 3. Making Requests

### Method Shortcuts

The quickest way to make requests. Each function returns a `Promise` that resolves with `response.data`.

| Function | Signature | Use for |
|---|---|---|
| `get` | `get(url, options?)` | Fetching resources |
| `post` | `post(url, data, options?)` | Creating resources |
| `put` | `put(url, data, options?)` | Full replacement updates |
| `patch` | `patch(url, data, options?)` | Partial updates |
| `del` | `del(url, options?)` | Deleting resources |

#### Examples

```js
// GET — fetch all users (authenticated by default)
const users = await get("/users/");

// POST — create a new resource
const newItem = await post("/items/", { name: "Widget", price: 9.99 });

// PUT — fully replace a resource
await put("/items/42/", { name: "Widget Pro", price: 14.99 });

// PATCH — partially update a resource
await patch("/items/42/", { price: 11.99 });

// DELETE — remove a resource
await del("/items/42/");
```

---

### Full `request()` Function

For full control over any request, use `request()` directly:

```js
import { request } from "./api";

const result = await request({
  method: "POST",
  url: "/users/me/change-password/",
  data: { old_password: "hunter2", new_password: "correcthorse" },
  auth: true,
  headers: { "X-Request-ID": "abc-123" },
  axiosOptions: { timeout: 8000 },
});
```

---

### Request Options Reference

All method shortcuts accept an `options` object as their last argument. These options are the same as the parameters for `request()`.

| Option | Type | Default | Description |
|---|---|---|---|
| `auth` | `boolean` | `true` | When `true`, attaches the `Bearer` access token from localStorage to the request |
| `params` | `object` | `null` | URL query parameters, e.g. `{ page: 2, search: "alice" }` |
| `headers` | `object` | `{}` | Additional HTTP headers to merge into the request |
| `axiosOptions` | `object` | `{}` | Any other valid [axios request config](https://axios-http.com/docs/req_config) options (e.g. `timeout`, `responseType`, `signal`) |

> For `post`, `put`, and `patch`, the request body (`data`) is the second argument, and `options` is always the third.

```js
// GET with query params
const page2 = await get("/users/", { params: { page: 2, search: "alice" } });

// POST with custom header and timeout
await post("/items/", { name: "Widget" }, {
  headers: { "X-Idempotency-Key": "unique-key-123" },
  axiosOptions: { timeout: 5000 },
});

// PATCH without auth (public endpoint)
await patch("/public/settings/", { theme: "dark" }, { auth: false });
```

---

## 4. Authentication

The `auth` object wraps all four Django auth endpoints and handles token storage automatically.

### Register

Creates a new account and immediately stores the returned tokens.

**Endpoint:** `POST /auth/register/`

```js
const response = await auth.register({
  username: "alice",
  email: "alice@example.com",
  password: "supersecret",
});

// response contains:
// {
//   user: { id, username, email, ... },
//   access: "eyJ...",
//   refresh: "eyJ..."
// }
console.log(response.user.username); // "alice"
```

After this call, the access and refresh tokens are stored in `localStorage` and all subsequent authenticated requests will use them automatically.

---

### Login

Authenticates with credentials and stores the returned tokens.

**Endpoint:** `POST /auth/login/`

```js
const response = await auth.login({
  username: "alice",
  password: "supersecret",
});

// response contains:
// {
//   user: { id, username, email, ... },
//   access: "eyJ...",
//   refresh: "eyJ..."
// }
```

---

### Logout

Blacklists the refresh token on the server and clears both tokens from `localStorage`.

**Endpoint:** `POST /auth/logout/`

```js
await auth.logout();

// After this, tokens.getAccess() and tokens.getRefresh() both return null.
// All subsequent requests with auth: true will have no Bearer token.
```

> Requires the user to be logged in. If the refresh token is already invalid or expired, the server returns a `400` error but tokens are still cleared locally.

---

### Manual Token Refresh

Manually trigger a token refresh without waiting for a `401`:

**Endpoint:** `POST /auth/token/refresh/`

```js
const newAccessToken = await auth.refreshToken();
console.log(newAccessToken); // "eyJ..." (new access token, already saved to localStorage)
```

You typically don't need this — the interceptor handles refresh automatically on `401` responses.

---

## 5. Authenticated vs. Public Requests

By default, every request attaches the `Authorization: Bearer <token>` header. To make a request without it, pass `auth: false`.

```js
// ✅ Authenticated (default) — token is attached automatically
const profile = await get("/users/me/");

// ✅ Public — no token is sent
const publicData = await get("/public/announcements/", { auth: false });

// ✅ Post without auth (register / login don't need a token)
// Note: auth.register() and auth.login() already handle this for you
await post("/auth/register/", userData, { auth: false });
```

---

## 6. Automatic Token Refresh

When any authenticated request returns a `401 Unauthorized`, the handler will:

1. Pause the failed request.
2. Call `POST /auth/token/refresh/` with the stored refresh token.
3. Save the new access token to `localStorage`.
4. Retry the original request with the new token.
5. Return the result as if nothing happened.

If multiple requests fail simultaneously with `401`, only **one** refresh call is made. All other requests are queued and replayed automatically once the new token arrives.

If the refresh itself fails (e.g. the refresh token is also expired), both tokens are cleared from `localStorage` and the original error is thrown. You can optionally uncomment the redirect in `api.js`:

```js
// In the refresh error handler in api.js:
tokens.clear();
window.location.href = "/login"; // Uncomment to auto-redirect on session expiry
```

---

## 7. Error Handling

All functions return Promises. Wrap calls in `try/catch` to handle errors gracefully.

```js
try {
  const data = await post("/auth/login/", { username: "alice", password: "wrong" });
} catch (error) {
  if (error.response) {
    // Server responded with a non-2xx status
    console.error("Status:", error.response.status);       // e.g. 401
    console.error("Detail:", error.response.data.detail);  // e.g. "No active account found..."
  } else if (error.request) {
    // Request was sent but no response received (network down, timeout, etc.)
    console.error("No response received:", error.request);
  } else {
    // Something went wrong setting up the request
    console.error("Request error:", error.message);
  }
}
```

Common status codes your Django backend returns:

| Status | Meaning |
|---|---|
| `200` | OK |
| `201` | Created (e.g. register, POST) |
| `400` | Bad request / validation error |
| `401` | Unauthorized — invalid or expired token |
| `403` | Forbidden — valid token but insufficient permissions |
| `404` | Resource not found |

---

## 8. Real-World Examples

### Full auth flow

```js
// 1. Register a new account
const { user } = await auth.register({
  username: "bob",
  email: "bob@example.com",
  password: "password123",
});

// 2. Fetch the current user's profile (token auto-attached)
const me = await get("/users/me/");
console.log(me.email); // "bob@example.com"

// 3. Update profile
await patch("/users/me/", { email: "bob2@example.com" });

// 4. Change password
await request({
  method: "PUT",
  url: "/users/me/change-password/",
  data: { old_password: "password123", new_password: "newpassword456" },
});

// 5. Log out
await auth.logout();
```

---

### Paginated list with query params

```js
const response = await get("/users/", {
  params: { page: 3, page_size: 20, search: "alice" },
});
```

---

### Admin: manage users

```js
// List all users (admin only)
const allUsers = await get("/users/");

// Get a specific user
const user = await get("/users/7/");

// Update a user
await patch("/users/7/", { is_active: false });

// Delete a user
await del("/users/7/");
```

---

### Request with abort signal (cancellation)

```js
const controller = new AbortController();

// Cancel after 3 seconds
setTimeout(() => controller.abort(), 3000);

try {
  const data = await get("/long-running-endpoint/", {
    axiosOptions: { signal: controller.signal },
  });
} catch (error) {
  if (axios.isCancel(error)) {
    console.log("Request cancelled.");
  }
}
```

---

### File upload (multipart)

```js
const formData = new FormData();
formData.append("avatar", fileInput.files[0]);

await post("/users/me/avatar/", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
```