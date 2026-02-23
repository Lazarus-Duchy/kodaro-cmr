import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/**
 * Schema — equivalent to models.py
 *
 * `authTables` from @convex-dev/auth provides the built-in
 * users / sessions / accounts / verificationCodes tables.
 * We extend the `users` table with our custom profile fields.
 */
export default defineSchema({
  ...authTables,

  users: defineTable({
    // ----- Identity (managed by @convex-dev/auth) -----
    email: v.string(),
    emailVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    // ----- Profile fields (mirrors the Django User model) -----
    firstName: v.optional(v.string()),   // first_name
    lastName: v.optional(v.string()),    // last_name
    isActive: v.optional(v.boolean()),   // is_active  (default true)
    isStaff: v.optional(v.boolean()),    // is_staff   (default false)
    // date_joined / updated_at are provided automatically by
    // Convex as _creationTime and a manual updatedAt field below.
    updatedAt: v.optional(v.number()),   // updated_at (epoch ms, set on write)
  })
    .index("email", ["email"]),          // unique lookup by email
});