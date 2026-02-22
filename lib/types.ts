/**
 * Shared TypeScript types across the app
 * These complement the auto-generated Convex types
 */

import { Id } from "@/convex/_generated/dataModel";

// ── User ─────────────────────────────────────────────────────────────────────
export interface User {
  _id: Id<"users">;
  _creationTime: number;
  clerkId: string;
  name: string;
  email: string;
  imageUrl?: string;
  isOnline: boolean;
  lastSeen: number;
}

// ── Conversation ──────────────────────────────────────────────────────────────
export interface Conversation {
  _id: Id<"conversations">;
  _creationTime: number;
  type: "direct" | "group";
  participantIds: string[];
  groupName?: string;
  groupCreatorId?: string;
  lastMessageTime?: number;
  lastMessagePreview?: string;
}

// ── Message ───────────────────────────────────────────────────────────────────
export interface Message {
  _id: Id<"messages">;
  _creationTime: number;
  conversationId: Id<"conversations">;
  senderId: string;
  content: string;
  isDeleted: boolean;
  reactions?: Record<string, string[]>; // { "👍": ["clerkId1", "clerkId2"] }
}

// ── TypingIndicator ──────────────────────────────────────────────────────────
export interface TypingIndicator {
  _id: Id<"typingIndicators">;
  conversationId: Id<"conversations">;
  userId: string;
  userName: string;
  lastTypedAt: number;
}

// ── ReadReceipt ──────────────────────────────────────────────────────────────
export interface ReadReceipt {
  _id: Id<"readReceipts">;
  conversationId: Id<"conversations">;
  userId: string;
  lastReadTime: number;
}
