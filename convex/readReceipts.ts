import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Mark conversation as read
export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("readReceipts")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastReadTime: Date.now() });
    } else {
      await ctx.db.insert("readReceipts", {
        conversationId: args.conversationId,
        userId: args.userId,
        lastReadTime: Date.now(),
      });
    }
  },
});

// Get unread count per conversation for a user
export const getUnreadCounts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const receipts = await ctx.db
      .query("readReceipts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const allMessages = await ctx.db.query("messages").collect();
    const result: Record<string, number> = {};

    for (const receipt of receipts) {
      const unread = allMessages.filter(
        (m) =>
          m.conversationId === receipt.conversationId &&
          m.senderId !== args.userId &&
          m._creationTime > receipt.lastReadTime
      );
      result[receipt.conversationId] = unread.length;
    }

    return result;
  },
});

// Get unread count for a specific conversation
export const getUnreadCount = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const receipt = await ctx.db
      .query("readReceipts")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.userId)
      )
      .unique();

    const lastReadTime = receipt?.lastReadTime ?? 0;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    return messages.filter(
      (m) => m.senderId !== args.userId && m._creationTime > lastReadTime
    ).length;
  },
});
