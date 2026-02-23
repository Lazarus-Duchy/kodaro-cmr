import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex schema for the CRM Campaign module.
 *
 * Two tables:
 *  - segments  : reusable audience definitions (static-ish, seeded once)
 *  - campaigns : the main campaign records, referencing segment IDs
 */
export default defineSchema({
  // ── Audience Segments ──────────────────────────────────────────────────────
  segments: defineTable({
    label:         v.string(),   // e.g. "Age 18–34"
    criteria:      v.string(),   // "age" | "location" | "purchase_history" | "behavior"
    estimatedSize: v.number(),   // rough contact count for audience preview
  }),

  // ── Campaigns ──────────────────────────────────────────────────────────────
  campaigns: defineTable({
    name:        v.string(),
    type:        v.string(),              // "Email" | "SMS" | "Social"
    start_date:  v.string(),              // ISO date string  "YYYY-MM-DD"
    end_date:    v.string(),              // ISO date string  "YYYY-MM-DD"
    budget:      v.optional(v.number()),  // USD, nullable
    goal:        v.string(),
    description: v.optional(v.string()),
    status:      v.string(),              // "Draft" | "Active" | "Paused" | "Completed"
    // Convex document IDs of the assigned segments (stored as strings)
    segment_ids: v.array(v.string()),
  }),
});