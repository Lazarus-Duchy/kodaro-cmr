import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ────────────────────────────────────────────────────────────────

/**
 * Return all segments. Optionally filter by one or more criteria values.
 * e.g. criteria = ["age", "location"]
 */
export const list = query({
  args: {
    criteria: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("segments").collect();
    if (!args.criteria || args.criteria.length === 0) return all;
    return all.filter((s) => args.criteria!.includes(s.criteria));
  },
});

// ── Mutations ──────────────────────────────────────────────────────────────

/**
 * Seed the segments table with default data.
 * Safe to run multiple times — skips insertion if segments already exist.
 *
 * Call this once from your app (e.g. on first load) or from the Convex
 * dashboard Functions tab:  segments:seed  →  Run
 */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("segments").collect();
    if (existing.length > 0) {
      // Already seeded — return existing IDs
      return existing.map((s) => s._id);
    }

    const defaultSegments = [
      { label: "Age 18–34",         criteria: "age",              estimatedSize: 12400 },
      { label: "Age 35–54",         criteria: "age",              estimatedSize: 9100  },
      { label: "Located in Warsaw", criteria: "location",         estimatedSize: 5800  },
      { label: "Located in Kraków", criteria: "location",         estimatedSize: 2900  },
      { label: "High-Value Buyers", criteria: "purchase_history", estimatedSize: 3200  },
      { label: "First-Time Buyers", criteria: "purchase_history", estimatedSize: 6700  },
      { label: "Frequent Visitors", criteria: "behavior",         estimatedSize: 7600  },
      { label: "Cart Abandoners",   criteria: "behavior",         estimatedSize: 4300  },
    ];

    const ids = await Promise.all(
      defaultSegments.map((s) => ctx.db.insert("segments", s))
    );

    return ids;
  },
});

/**
 * Add a custom segment (for future admin UI use).
 */
export const create = mutation({
  args: {
    label:         v.string(),
    criteria:      v.string(),
    estimatedSize: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("segments", args);
  },
});