/**
 * Convex Database Schema
 * ----------------------
 * Defines all tables and their indexes.
 * Clean, extensible design — each table has a clear purpose.
 *
 * Tables:
 *  users         — user profiles synced from Clerk
 *  conversations — DM or group chats between users  
 *  messages      — individual messages in a conversation
 *  readReceipts  — tracks when each user last read each conversation
 *  typingIndicators — real-time "X is typing" state
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── users ──────────────────────────────────────────────────────────────────
  // Synced from Clerk via webhook + on app load.
  // clerkId is the primary identifier used everywhere.
  users: defineTable({
    clerkId: v.string(),        // Clerk's user ID (e.g. "user_2abc...")
    name: v.string(),           // Full name from Clerk
    email: v.string(),          // Primary email
    imageUrl: v.optional(v.string()), // Profile picture URL (Google avatar, etc.)
    isOnline: v.boolean(),      // Real-time online presence
    lastSeen: v.number(),       // Unix timestamp of last activity
  })
    .index("by_clerkId", ["clerkId"])  // Fast lookup by Clerk ID
    .index("by_email", ["email"]),      // Fast lookup by email

  // ── conversations ──────────────────────────────────────────────────────────
  // Supports both 1-on-1 DMs (type: "direct") and group chats (type: "group").
  // participantIds is an array of Clerk user IDs.
  conversations: defineTable({
    type: v.union(v.literal("direct"), v.literal("group")),
    participantIds: v.array(v.string()),       // Clerk IDs of all members
    groupName: v.optional(v.string()),         // Only for group chats
    groupCreatorId: v.optional(v.string()),    // Clerk ID of group creator
    lastMessageTime: v.optional(v.number()),   // For sorting in sidebar
    lastMessagePreview: v.optional(v.string()), // Preview text in sidebar
  })
    .index("by_participants", ["participantIds"]),

  // ── messages ───────────────────────────────────────────────────────────────
  // Each message belongs to a conversation.
  // Soft delete: isDeleted=true shows "This message was deleted" to everyone.
  // Reactions: { "👍": ["user_abc", "user_xyz"], "❤️": ["user_abc"] }
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(),
    content: v.string(),
    isDeleted: v.boolean(),
    editedAt: v.optional(v.number()),      // Unix timestamp when edited; if set, show "edited"
    reactions: v.optional(
      v.record(v.string(), v.array(v.string()))
    ),
  })
    .index("by_conversation", ["conversationId"]),

  // ── readReceipts ───────────────────────────────────────────────────────────
  // Tracks when each user last read each conversation.
  // Unread count = messages after lastReadTime that aren't from this user.
  readReceipts: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),       // Clerk ID
    lastReadTime: v.number(), // Unix timestamp
  })
    .index("by_conversation_user", ["conversationId", "userId"])
    .index("by_user", ["userId"]),

  // ── typingIndicators ──────────────────────────────────────────────────────
  // Ephemeral state: who is currently typing in a conversation.
  // Entries are created when typing starts, deleted when done.
  // Auto-expires: frontend ignores entries older than 3 seconds.
  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(),     // Clerk ID of who is typing
    userName: v.string(),   // Name to display: "Priya is typing..."
    lastTypedAt: v.number(), // Unix timestamp — used to auto-expire
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_user", ["conversationId", "userId"]),
});
