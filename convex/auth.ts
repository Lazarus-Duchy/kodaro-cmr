import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

// ---------------------------------------------------------------------------
// Auth provider configuration
// Equivalent to Django's CustomTokenObtainPairSerializer + RegisterSerializer
// ---------------------------------------------------------------------------

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password<DataModel>({
      /**
       * Called after a new user signs up with email + password.
       * Equivalent to RegisterSerializer.create() — sets default profile fields.
       */
      profile(params) {
        return {
          email: params.email as string,
          firstName: (params.firstName as string | undefined) ?? "",
          lastName: (params.lastName as string | undefined) ?? "",
          isActive: true,
          isStaff: false,
          updatedAt: Date.now(),
        };
      },
    }),
  ],
});

// ---------------------------------------------------------------------------
// Helper: assert the caller is authenticated
// ---------------------------------------------------------------------------
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated.");
  }
  return userId;
}

// ---------------------------------------------------------------------------
// Helper: assert the caller is an admin (is_staff === true)
// ---------------------------------------------------------------------------
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await requireAuth(ctx);
  const user = await ctx.db.get(userId);
  if (!user?.isStaff) {
    throw new Error("Admin access required.");
  }
  return userId;
}