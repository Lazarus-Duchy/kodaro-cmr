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

  emergencyCalls: defineTable({
    caller_name:  v.string(),
    caller_phone: v.string(),
    location:     v.string(),
    priority:     v.union(
      v.literal('critical'),
      v.literal('high'),
      v.literal('medium'),
      v.literal('low'),
    ),
    call_type: v.union(
      v.literal('medical'),
      v.literal('fire'),
      v.literal('rescue'),
      v.literal('police'),
      v.literal('natural_disaster'),
      v.literal('hazmat'),
      v.literal('other'),
    ),
    status: v.union(
      v.literal('pending'),
      v.literal('dispatched'),
      v.literal('on_scene'),
      v.literal('resolved'),
      v.literal('false_alarm'),
      v.literal('cancelled'),
    ),
    assigned_to: v.optional(v.string()),
    notes:       v.optional(v.string()),
  })
    .index('by_status',   ['status'])
    .index('by_priority', ['priority']),
});