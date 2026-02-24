import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// ── Validators (reused across mutations) ─────────────────────────────────────

const callFields = {
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
};

// ── Queries ───────────────────────────────────────────────────────────────────

/** Return all emergency calls, newest first. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('emergencyCalls')
      .order('desc')
      .collect();
  },
});

/** Return a single call by id. */
export const get = query({
  args: { id: v.id('emergencyCalls') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/**
 * Aggregate stats used by the summary cards:
 *  - total: all calls ever logged
 *  - active: pending + dispatched + on_scene
 *  - critical: calls with priority === 'critical'
 *  - byStatus: { [status]: count }
 *  - byPriority: { [priority]: count }
 *  - byCallType: { [call_type]: count }
 */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('emergencyCalls').collect();

    const ACTIVE_STATUSES = new Set(['pending', 'dispatched', 'on_scene']);

    const byStatus:    Record<string, number> = {};
    const byPriority:  Record<string, number> = {};
    const byCallType:  Record<string, number> = {};
    let active   = 0;
    let critical = 0;

    for (const call of all) {
      // by_status
      byStatus[call.status] = (byStatus[call.status] ?? 0) + 1;

      // by_priority
      byPriority[call.priority] = (byPriority[call.priority] ?? 0) + 1;

      // by_call_type
      byCallType[call.call_type] = (byCallType[call.call_type] ?? 0) + 1;

      // active count
      if (ACTIVE_STATUSES.has(call.status)) active++;

      // critical count
      if (call.priority === 'critical') critical++;
    }

    return {
      total: all.length,
      active,
      critical,
      byStatus,
      byPriority,
      byCallType,
    };
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────────

/** Create a new emergency call record. */
export const create = mutation({
  args: callFields,
  handler: async (ctx, args) => {
    const id = await ctx.db.insert('emergencyCalls', {
      ...args,
      assigned_to: args.assigned_to ?? '',
      notes:       args.notes       ?? '',
    });
    return id;
  },
});

/** Update an existing call by id. All fields are optional for partial edits. */
export const update = mutation({
  args: {
    id:          v.id('emergencyCalls'),
    caller_name:  v.optional(v.string()),
    caller_phone: v.optional(v.string()),
    location:     v.optional(v.string()),
    priority:     v.optional(v.union(
      v.literal('critical'),
      v.literal('high'),
      v.literal('medium'),
      v.literal('low'),
    )),
    call_type: v.optional(v.union(
      v.literal('medical'),
      v.literal('fire'),
      v.literal('rescue'),
      v.literal('police'),
      v.literal('natural_disaster'),
      v.literal('hazmat'),
      v.literal('other'),
    )),
    status: v.optional(v.union(
      v.literal('pending'),
      v.literal('dispatched'),
      v.literal('on_scene'),
      v.literal('resolved'),
      v.literal('false_alarm'),
      v.literal('cancelled'),
    )),
    assigned_to: v.optional(v.string()),
    notes:       v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    // Filter out undefined values so unset optional fields are not overwritten
    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, patch);
    return await ctx.db.get(id);
  },
});

/** Permanently delete a call record. */
export const remove = mutation({
  args: { id: v.id('emergencyCalls') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { deleted: id };
  },
});