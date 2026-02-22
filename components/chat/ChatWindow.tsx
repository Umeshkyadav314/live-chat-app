"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useRef, useState, useCallback } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import ChatHeader from "./ChatHeader";
import { formatDateSeparator, shouldShowDateSeparator } from "@/lib/dateUtils";

interface ChatWindowProps {
  conversationId: string;
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const { user } = useUser();
  const convId = conversationId as Id<"conversations">;

  const messages = useQuery(api.messages.getMessages, { conversationId: convId });
  const conversation = useQuery(api.conversations.getConversation, { conversationId: convId });
  const typingUsers = useQuery(
    api.typing.getTypingUsers,
    user ? { conversationId: convId, currentUserId: user.id } : "skip"
  );
  const markAsRead = useMutation(api.readReceipts.markAsRead);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [showNewMessageBtn, setShowNewMessageBtn] = useState(false);

  // Mark conversation as read on open
  useEffect(() => {
    if (user && convId) {
      markAsRead({ conversationId: convId, userId: user.id });
    }
  }, [user, convId, markAsRead]);

  // Mark as read when new messages arrive and user is at bottom
  useEffect(() => {
    if (messages && user && !isUserScrolledUp) {
      markAsRead({ conversationId: convId, userId: user.id });
    }
  }, [messages?.length, user, convId, isUserScrolledUp, markAsRead]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    if (isUserScrolledUp) {
      setShowNewMessageBtn(true);
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages?.length, isUserScrolledUp]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 80;
    setIsUserScrolledUp(!isAtBottom);
    if (isAtBottom) setShowNewMessageBtn(false);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowNewMessageBtn(false);
    setIsUserScrolledUp(false);
    if (user) markAsRead({ conversationId: convId, userId: user.id });
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      <ChatHeader conversation={conversation} currentUserId={user?.id ?? ""} />

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
      >
        {!messages ? (
          <MessageSkeletons />
        ) : messages.length === 0 ? (
          <EmptyMessages />
        ) : (
          <>
            {messages.map((msg, idx) => {
              const prev = messages[idx - 1];
              const showDate = shouldShowDateSeparator(
                msg._creationTime,
                prev?._creationTime
              );
              return (
                <div key={msg._id}>
                  {showDate && (
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium px-2">
                        {formatDateSeparator(msg._creationTime)}
                      </span>
                      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
                    </div>
                  )}
                  <MessageBubble
                    message={msg}
                    isOwn={msg.senderId === user?.id}
                    currentUserId={user?.id ?? ""}
                  />
                </div>
              );
            })}
            {typingUsers && typingUsers.length > 0 && (
              <TypingIndicator users={typingUsers} />
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* New messages button */}
      {showNewMessageBtn && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
          <button
            onClick={scrollToBottom}
            className="flex items-center gap-2 bg-blue-600 dark:bg-blue-500 text-white text-sm px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all"
          >
            ↓ New messages
          </button>
        </div>
      )}

      <MessageInput
        conversationId={convId}
        currentUserId={user?.id ?? ""}
        currentUserName={user?.fullName ?? ""}
        onMessageSent={scrollToBottom}
      />
    </div>
  );
}

function EmptyMessages() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center">
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-blue-400 dark:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <p className="text-slate-600 dark:text-slate-300 font-medium">No messages yet</p>
      <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Be the first to say something! 👋</p>
    </div>
  );
}

function MessageSkeletons() {
  return (
    <div className="space-y-4 py-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`flex gap-3 animate-pulse ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex-shrink-0" />
          <div className={`space-y-1 ${i % 2 === 0 ? "items-end" : "items-start"} flex flex-col`}>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
            <div className={`h-10 bg-slate-200 dark:bg-slate-700 rounded-2xl w-${i % 2 === 0 ? "40" : "52"}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
