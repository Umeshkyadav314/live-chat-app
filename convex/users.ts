/**
 * users.ts — Convex User Functions
 * ----------------------------------
 * All queries and mutations related to user profiles.
 * Users are stored here so other users can discover them,
 * see their online status, and start conversations.
 *
 * User data originates from Clerk (via webhook) and is synced here.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── MUTATIONS ────────────────────────────────────────────────────────────────

/**
 * upsertUser — Create or update a user profile
 * Called from:
 *  1. Clerk webhook (user.created / user.updated)
 *  2. ChatLayoutClient on every app load (ensures latest data)
 */
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      // Update existing user — keep online status, update profile info
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
        isOnline: true,
        lastSeen: Date.now(),
      });
      return existing._id;
    }

    // First time this user logs in — create their profile
    return await ctx.db.insert("users", {
      ...args,
      isOnline: true,
      lastSeen: Date.now(),
    });
  },
});

/**
 * setOnlineStatus — Mark a user as online or offline
 * Called from ChatLayoutClient using browser visibility API
 * (visibilitychange + beforeunload events)
 */
export const setOnlineStatus = mutation({
  args: {
    clerkId: v.string(),
    isOnline: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        isOnline: args.isOnline,
        lastSeen: Date.now(),
      });
    }
  },
});

/**
 * deleteUser — Soft-remove user when Clerk fires user.deleted webhook
 * We mark them offline rather than hard-deleting to preserve message history
 */
export const deleteUser = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      // Keep the user record (so old messages still show their name)
      // Just mark them offline
      await ctx.db.patch(user._id, {
        isOnline: false,
        lastSeen: Date.now(),
      });
    }
  },
});

// ── QUERIES ──────────────────────────────────────────────────────────────────

/**
 * getAllUsers — Get all users except the current user
 * Supports optional search filter for the People tab
 */
export const getAllUsers = query({
  args: {
    currentClerkId: v.string(),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => u.clerkId !== args.currentClerkId)
      .filter((u) => {
        if (!args.search) return true;
        return (
          u.name.toLowerCase().includes(args.search.toLowerCase()) ||
          u.email.toLowerCase().includes(args.search.toLowerCase())
        );
      })
      // Online users appear first
      .sort((a, b) => {
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return a.name.localeCompare(b.name);
      });
  },
});

/**
 * getUserByClerkId — Get a single user's profile
 * Used in ChatHeader to show the other person's name/avatar/status
 */
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

/**
 * getUsersByClerkIds — Batch fetch multiple users
 * Used in group chat to display all member names
 */
export const getUsersByClerkIds = query({
  args: { clerkIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const users = await Promise.all(
      args.clerkIds.map((id) =>
        ctx.db
          .query("users")
          .withIndex("by_clerkId", (q) => q.eq("clerkId", id))
          .unique()
      )
    );
    return users.filter(Boolean);
  },
});

/**
 * getCurrentUser — Get the currently logged-in user's profile
 * Used in sidebar header to show "you"
 */
export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});
