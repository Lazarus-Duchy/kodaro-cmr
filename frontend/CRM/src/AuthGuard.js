import axios from "axios";
import { tokens } from "./api";

const BASE_URL = "http://localhost:8000/api";

/**
 * Verifies the stored access token against the backend.
 * If the access token is expired, attempts to refresh it.
 * If both fail, clears localStorage and redirects to the home/login page.
 *
 * Call this at the top of any protected page/component.
 *
 * @param {string} [redirectTo="/"]  Path to redirect to on auth failure.
 * @returns {Promise<boolean>}       true = authenticated, false = redirected.
 */
export async function authGuard(redirectTo = "/") {
  const accessToken  = tokens.getAccess();
  const refreshToken = tokens.getRefresh();

  // No tokens at all → not logged in
  if (!accessToken && !refreshToken) {
    clearAndRedirect(redirectTo);
    return false;
  }

  // Try verifying the access token
  if (accessToken) {
    const valid = await verifyToken(accessToken);
    if (valid) return true;
  }

  // Access token invalid/expired → try refreshing
  if (refreshToken) {
    const newAccess = await tryRefresh(refreshToken);
    if (newAccess) {
      tokens.setAccess(newAccess);
      return true;
    }
  }

  // Both failed
  clearAndRedirect(redirectTo);
  return false;
}

/**
 * Returns true if the access token is accepted by the backend.
 */
async function verifyToken(accessToken) {
  try {
    await axios.get(`${BASE_URL}/users/me/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Attempts a token refresh. Returns the new access token string, or null.
 */
async function tryRefresh(refreshToken) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
      refresh: refreshToken,
    });
    return response.data?.access ?? null;
  } catch {
    return null;
  }
}

/**
 * Clears all auth data from localStorage and redirects.
 */
function clearAndRedirect(redirectTo) {
  tokens.clear();
  window.location.href = redirectTo;
}

/**
 * React hook version — call inside a component's useEffect.
 *
 * Usage:
 *   import { useAuthGuard } from './authGuard';
 *   const Clients = () => {
 *     useAuthGuard();
 *     ...
 *   };
 */
export function useAuthGuard(redirectTo = "/") {
  // Import useEffect lazily so this file works outside React too
  const { useEffect } = require("react");
  useEffect(() => {
    authGuard(redirectTo);
  }, []);
}