import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ────────────────────────────────────────────────────────────────

/**
 * Get every campaign, newest first.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("campaigns").order("desc").collect();
  },
});

/**
 * Get a single campaign by its Convex document ID.
 */
export const getById = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ── Mutations ──────────────────────────────────────────────────────────────

/**
 * Create a new campaign and return its generated ID.
 */
export const create = mutation({
  args: {
    name:        v.string(),
    type:        v.string(),
    start_date:  v.string(),
    end_date:    v.string(),
    budget:      v.optional(v.number()),
    goal:        v.string(),
    description: v.optional(v.string()),
    status:      v.string(),
    segment_ids: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Basic server-side validation
    if (!args.name.trim())       throw new Error("Campaign name is required.");
    if (!args.type.trim())       throw new Error("Campaign type is required.");
    if (!args.start_date.trim()) throw new Error("Start date is required.");
    if (!args.end_date.trim())   throw new Error("End date is required.");
    if (!args.goal.trim())       throw new Error("Goal is required.");

    const id = await ctx.db.insert("campaigns", {
      name:        args.name.trim(),
      type:        args.type,
      start_date:  args.start_date,
      end_date:    args.end_date,
      budget:      args.budget,
      goal:        args.goal.trim(),
      description: args.description?.trim() ?? "",
      status:      args.status,
      segment_ids: args.segment_ids,
    });

    return id;
  },
});

/**
 * Update an existing campaign. Only the provided fields are overwritten.
 */
export const update = mutation({
  args: {
    id:          v.id("campaigns"),
    name:        v.optional(v.string()),
    type:        v.optional(v.string()),
    start_date:  v.optional(v.string()),
    end_date:    v.optional(v.string()),
    budget:      v.optional(v.number()),
    goal:        v.optional(v.string()),
    description: v.optional(v.string()),
    status:      v.optional(v.string()),
    segment_ids: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;

    const existing = await ctx.db.get(id);
    if (!existing) throw new Error(`Campaign ${id} not found.`);

    // Build patch object — only include keys that were actually passed
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }

    await ctx.db.patch(id, patch);
    return id;
  },
});

/**
 * Permanently delete a campaign by ID.
 */
export const remove = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error(`Campaign ${args.id} not found.`);
    await ctx.db.delete(args.id);
    return args.id;
  },
});