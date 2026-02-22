"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ChatHeaderProps {
  conversation: any;
  currentUserId: string;
}

export default function ChatHeader({ conversation, currentUserId }: ChatHeaderProps) {
  const otherUserId = conversation.type === "direct"
    ? conversation.participantIds.find((id: string) => id !== currentUserId)
    : null;

  const otherUser = useQuery(
    api.users.getUserByClerkId,
    otherUserId ? { clerkId: otherUserId } : "skip"
  );

  const displayName = conversation.type === "group"
    ? conversation.groupName
    : otherUser?.name ?? "Loading...";

  const subtitle = conversation.type === "group"
    ? `${conversation.participantIds.length} members`
    : otherUser?.isOnline
    ? "Online"
    : "Offline";

  const isOnline = conversation.type === "direct" && otherUser?.isOnline;

  return (
    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center gap-3 shadow-sm">
      <div className="relative">
        {conversation.type === "group" ? (
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {conversation.groupName?.charAt(0).toUpperCase()}
          </div>
        ) : otherUser?.imageUrl ? (
          <img src={otherUser.imageUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
            {displayName?.charAt(0).toUpperCase()}
          </div>
        )}
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{displayName}</h2>
        <p className={`text-xs ${isOnline ? "text-green-500" : "text-slate-400 dark:text-slate-500"}`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}
