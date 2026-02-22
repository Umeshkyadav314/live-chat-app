import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send a message
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      isDeleted: false,
      reactions: {},
    });

    // Update conversation preview
    await ctx.db.patch(args.conversationId, {
      lastMessageTime: Date.now(),
      lastMessagePreview: args.content.slice(0, 80),
    });

    return messageId;
  },
});

// Get all messages in a conversation
export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();
  },
});

// Edit a message (only sender, shows "edited" label)
export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    senderId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message || message.senderId !== args.senderId) {
      throw new Error("Unauthorized");
    }
    if (message.isDeleted) throw new Error("Cannot edit deleted message");
    await ctx.db.patch(args.messageId, {
      content: args.content,
      editedAt: Date.now(),
    });
    // Update conversation preview if this was the last message
    const conv = await ctx.db.get(message.conversationId);
    if (conv?.lastMessageTime && message._creationTime >= (conv.lastMessageTime - 1000)) {
      await ctx.db.patch(message.conversationId, {
        lastMessagePreview: args.content.slice(0, 80),
      });
    }
  },
});

// Soft delete a message
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    senderId: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message || message.senderId !== args.senderId) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.messageId, { isDeleted: true });
  },
});

// Toggle a reaction on a message
export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.string(),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const reactions = message.reactions ?? {};
    const currentReactors = reactions[args.emoji] ?? [];

    let updatedReactors: string[];
    if (currentReactors.includes(args.userId)) {
      // Remove reaction
      updatedReactors = currentReactors.filter((id) => id !== args.userId);
    } else {
      // Add reaction
      updatedReactors = [...currentReactors, args.userId];
    }

    const updatedReactions = { ...reactions };
    if (updatedReactors.length === 0) {
      delete updatedReactions[args.emoji];
    } else {
      updatedReactions[args.emoji] = updatedReactors;
    }

    await ctx.db.patch(args.messageId, { reactions: updatedReactions });
  },
});
