import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get or create a direct conversation between two users
export const getOrCreateDirect = mutation({
  args: {
    currentUserId: v.string(),
    otherUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if conversation already exists
    const allConvos = await ctx.db
      .query("conversations")
      .collect();

    const existing = allConvos.find(
      (c) =>
        c.type === "direct" &&
        c.participantIds.includes(args.currentUserId) &&
        c.participantIds.includes(args.otherUserId) &&
        c.participantIds.length === 2
    );

    if (existing) return existing._id;

    // Create new conversation
    return await ctx.db.insert("conversations", {
      type: "direct",
      participantIds: [args.currentUserId, args.otherUserId],
      lastMessageTime: Date.now(),
      lastMessagePreview: "",
    });
  },
});

// Create a group conversation
export const createGroup = mutation({
  args: {
    groupName: v.string(),
    participantIds: v.array(v.string()),
    creatorId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversations", {
      type: "group",
      groupName: args.groupName,
      groupCreatorId: args.creatorId,
      participantIds: args.participantIds,
      lastMessageTime: Date.now(),
      lastMessagePreview: "",
    });
  },
});

// Get all conversations for a user
export const getMyConversations = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const allConvos = await ctx.db.query("conversations").collect();
    const myConvos = allConvos.filter((c) =>
      c.participantIds.includes(args.userId)
    );

    // Sort by last message time
    return myConvos.sort(
      (a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0)
    );
  },
});

// Get a single conversation
export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});
