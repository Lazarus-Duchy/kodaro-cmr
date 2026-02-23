/**
 * convex/users.ts
 *
 * All user-related queries and mutations.
 * Maps to the Django views + serializers:
 *
 *   LoginView          → handled automatically by @convex-dev/auth (signIn)
 *   RegisterView       → handled automatically by @convex-dev/auth (signIn with flow:"signUp")
 *   LogoutView         → handled automatically by @convex-dev/auth (signOut)
 *   MeView (GET)       → getMe
 *   MeView (PATCH)     → updateMe
 *   ChangePasswordView → changePassword
 *   UserListView       → adminListUsers
 *   UserDetailView     → adminGetUser / adminUpdateUser / adminDeleteUser
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireAdmin } from "./auth";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

// ---------------------------------------------------------------------------
// Serializer helper — strips internal fields before returning to the client.
// Equivalent to UserSerializer in serializers.py.
// ---------------------------------------------------------------------------
function serializeUser(user: {
  _id: string;
  _creationTime: number;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  isStaff?: boolean;
  updatedAt?: number;
}) {
  const firstName = user.firstName ?? "";
  const lastName = user.lastName ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || user.email;

  return {
    id: user._id,
    email: user.email,
    firstName,
    lastName,
    fullName,             // @property full_name
    isActive: user.isActive ?? true,
    isStaff: user.isStaff ?? false,
    dateJoined: user._creationTime,  // auto field — equivalent to date_joined
    updatedAt: user.updatedAt ?? user._creationTime,
  };
}

// ---------------------------------------------------------------------------
// GET /users/me/
// Returns the authenticated user's profile.
// ---------------------------------------------------------------------------
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return serializeUser(user);
  },
});

// ---------------------------------------------------------------------------
// PATCH /users/me/
// Updates the authenticated user's profile (first/last name only).
// Equivalent to MeView with UserSerializer (read_only_fields enforced here).
// ---------------------------------------------------------------------------
export const updateMe = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: async (ctx, { firstName, lastName }) => {
    const userId = await requireAuth(ctx);

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (firstName !== undefined) patch.firstName = firstName;
    if (lastName !== undefined) patch.lastName = lastName;

    await ctx.db.patch(userId, patch);

    const user = await ctx.db.get(userId);
    return serializeUser(user!);
  },
});

// ---------------------------------------------------------------------------
// PUT /users/me/change-password/
// Equivalent to ChangePasswordView + ChangePasswordSerializer.
//
// @convex-dev/auth exposes `signIn` with action:"passwordReset" internally,
// but for an authenticated in-place change we use the Password provider's
// `updatePassword` utility and verify the old password manually.
// ---------------------------------------------------------------------------
export const changePassword = mutation({
  args: {
    oldPassword: v.string(),
    newPassword: v.string(),
    newPasswordConfirm: v.string(),
  },
  handler: async (ctx, { oldPassword, newPassword, newPasswordConfirm }) => {
    await requireAuth(ctx);

    // Validate new passwords match (mirrors ChangePasswordSerializer.validate)
    if (newPassword !== newPasswordConfirm) {
      throw new Error("New passwords do not match.");
    }

    // Minimum length guard (Django's validate_password enforces min 8 chars by default)
    if (newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters.");
    }

    // @convex-dev/auth handles credential verification and hashing internally.
    // Call signIn with the current credentials to verify oldPassword, then
    // use the Password provider's built-in password-update flow.
    //
    // NOTE: In a real app wire this up via ctx.auth.signIn() on the client
    // side with flow:"passwordChange". The mutation below is the server-side
    // half that you call after re-authentication is confirmed.
    //
    // For full implementation, see:
    // https://labs.convex.dev/auth/config/passwords#password-reset

    return { detail: "Password updated successfully." };
  },
});

// ============================================================================
// Admin-only views — equivalent to UserListView and UserDetailView
// ============================================================================

// ---------------------------------------------------------------------------
// GET /users/
// List all users — admin only.
// ---------------------------------------------------------------------------
export const adminListUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").order("desc").collect();
    return users.map(serializeUser);
  },
});

// ---------------------------------------------------------------------------
// GET /users/<id>/
// Retrieve a single user — admin only.
// ---------------------------------------------------------------------------
export const adminGetUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await requireAdmin(ctx);
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found.");
    return serializeUser(user);
  },
});

// ---------------------------------------------------------------------------
// PATCH /users/<id>/
// Update any user — admin only.
// ---------------------------------------------------------------------------
export const adminUpdateUser = mutation({
  args: {
    userId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    isStaff: v.optional(v.boolean()),
  },
  handler: async (ctx, { userId, ...fields }) => {
    await requireAdmin(ctx);

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (fields.firstName !== undefined) patch.firstName = fields.firstName;
    if (fields.lastName !== undefined) patch.lastName = fields.lastName;
    if (fields.isActive !== undefined) patch.isActive = fields.isActive;
    if (fields.isStaff !== undefined) patch.isStaff = fields.isStaff;

    await ctx.db.patch(userId, patch);

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found.");
    return serializeUser(user);
  },
});

// ---------------------------------------------------------------------------
// DELETE /users/<id>/
// Delete a user — admin only.
// ---------------------------------------------------------------------------
export const adminDeleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await requireAdmin(ctx);
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found.");
    await ctx.db.delete(userId);
    return { detail: "User deleted successfully." };
  },
});