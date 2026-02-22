"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { formatMessageTime } from "@/lib/dateUtils";
import { Id } from "@/convex/_generated/dataModel";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SidebarProps {
  onConversationOpen: () => void;
}

type Tab = "chats" | "users";

export default function Sidebar({ onConversationOpen }: SidebarProps) {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState<Tab>("chats");
  const [search, setSearch] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);

  const conversations = useQuery(
    api.conversations.getMyConversations,
    user ? { userId: user.id } : "skip"
  );

  const allUsers = useQuery(
    api.users.getAllUsers,
    user ? { currentClerkId: user.id, search } : "skip"
  );

  const unreadCounts = useQuery(
    api.readReceipts.getUnreadCounts,
    user ? { userId: user.id } : "skip"
  );

  const getOrCreateDirect = useMutation(api.conversations.getOrCreateDirect);

  const handleUserClick = async (otherUserId: string) => {
    if (!user) return;
    const convId = await getOrCreateDirect({
      currentUserId: user.id,
      otherUserId,
    });
    router.push(`/chat/${convId}`);
    onConversationOpen();
    setTab("chats");
  };

  const handleConversationClick = (convId: string) => {
    router.push(`/chat/${convId}`);
    onConversationOpen();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">TarsChat</h1>
        </div>
        <ThemeToggle />
        <button
          onClick={() => setShowGroupModal(true)}
          className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title="New Group"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <UserButton afterSignOutUrl="/sign-in" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setTab("chats")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            tab === "chats"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Chats
        </button>
        <button
          onClick={() => setTab("users")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            tab === "users"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          People
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "chats" ? "Search chats..." : "Search people..."}
            className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "chats" ? (
          <ConversationList
            conversations={conversations}
            currentUserId={user?.id ?? ""}
            unreadCounts={unreadCounts ?? {}}
            search={search}
            currentPath={pathname}
            onConversationClick={handleConversationClick}
          />
        ) : (
          <UserList
            users={allUsers}
            onUserClick={handleUserClick}
          />
        )}
      </div>

      {showGroupModal && user && (
        <CreateGroupModal
          currentUserId={user.id}
          allUsers={allUsers ?? []}
          onClose={() => setShowGroupModal(false)}
          onCreated={(id) => {
            router.push(`/chat/${id}`);
            onConversationOpen();
            setShowGroupModal(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Conversation List ───────────────────────────────────────────────────────

function ConversationList({
  conversations,
  currentUserId,
  unreadCounts,
  search,
  currentPath,
  onConversationClick,
}: {
  conversations: any[] | undefined;
  currentUserId: string;
  unreadCounts: Record<string, number>;
  search: string;
  currentPath: string;
  onConversationClick: (id: string) => void;
}) {
  const allUsers = useQuery(api.users.getAllUsers, { currentClerkId: currentUserId, search: "" });

  if (!conversations) {
    return (
      <div className="space-y-2 p-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
            <div className="w-11 h-11 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const getUserName = (participantIds: string[]) => {
    const otherId = participantIds.find((id) => id !== currentUserId);
    const otherUser = allUsers?.find((u) => u.clerkId === otherId);
    return otherUser?.name ?? "Unknown";
  };

  const getUserAvatar = (participantIds: string[]) => {
    const otherId = participantIds.find((id) => id !== currentUserId);
    return allUsers?.find((u) => u.clerkId === otherId);
  };

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    if (c.type === "group") return c.groupName?.toLowerCase().includes(search.toLowerCase());
    return getUserName(c.participantIds).toLowerCase().includes(search.toLowerCase());
  });

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          {search ? "No chats found" : "No conversations yet"}
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
          {search ? "Try a different search term" : "Go to People tab to start a chat"}
        </p>
      </div>
    );
  }

  return (
    <div className="py-1">
      {filtered.map((conv) => {
        const isActive = currentPath === `/chat/${conv._id}`;
        const unread = unreadCounts[conv._id] ?? 0;
        const otherUser = conv.type === "direct" ? getUserAvatar(conv.participantIds) : null;
        const displayName = conv.type === "group" ? conv.groupName : getUserName(conv.participantIds);

        return (
          <button
            key={conv._id}
            onClick={() => onConversationClick(conv._id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
              isActive ? "bg-blue-50 dark:bg-slate-800" : ""
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {conv.type === "group" ? (
                <div className="w-11 h-11 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {conv.groupName?.charAt(0).toUpperCase()}
                </div>
              ) : otherUser?.imageUrl ? (
                <img src={otherUser.imageUrl} alt={displayName} className="w-11 h-11 rounded-full object-cover" />
              ) : (
                <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Online dot */}
              {conv.type === "direct" && otherUser?.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold truncate ${isActive ? "text-blue-700 dark:text-blue-300" : "text-slate-800 dark:text-slate-200"}`}>
                  {displayName}
                </span>
                <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                  {conv.lastMessageTime && (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {formatMessageTime(conv.lastMessageTime)}
                    </span>
                  )}
                  {unread > 0 && (
                    <span className="bg-blue-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
              </div>
              {conv.lastMessagePreview && (
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {conv.lastMessagePreview}
                </p>
              )}
              {conv.type === "group" && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {conv.participantIds.length} members
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── User List ───────────────────────────────────────────────────────────────

function UserList({
  users,
  onUserClick,
}: {
  users: any[] | undefined;
  onUserClick: (id: string) => void;
}) {
  if (!users) {
    return (
      <div className="space-y-2 p-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
            <div className="w-11 h-11 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-1" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No users found</p>
        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Try a different search</p>
      </div>
    );
  }

  return (
    <div className="py-1">
      {users.map((u) => (
        <button
          key={u.clerkId}
          onClick={() => onUserClick(u.clerkId)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="relative flex-shrink-0">
            {u.imageUrl ? (
              <img src={u.imageUrl} alt={u.name} className="w-11 h-11 rounded-full object-cover" />
            ) : (
              <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {u.name.charAt(0).toUpperCase()}
              </div>
            )}
            {u.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{u.name}</p>
            <p className={`text-xs font-medium ${u.isOnline ? "text-green-500" : "text-slate-400 dark:text-slate-500"}`}>
              {u.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Create Group Modal ──────────────────────────────────────────────────────

function CreateGroupModal({
  currentUserId,
  allUsers,
  onClose,
  onCreated,
}: {
  currentUserId: string;
  allUsers: any[];
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const createGroup = useMutation(api.conversations.createGroup);

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedIds.length < 2) return;
    setLoading(true);
    try {
      const id = await createGroup({
        groupName: groupName.trim(),
        participantIds: [currentUserId, ...selectedIds],
        creatorId: currentUserId,
      });
      onCreated(id as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">New Group Chat</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name"
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Select at least 2 members</p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {allUsers.map((u) => (
                <label key={u.clerkId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(u.clerkId)}
                    onChange={() => toggle(u.clerkId)}
                    className="rounded text-blue-600"
                  />
                  {u.imageUrl ? (
                    <img src={u.imageUrl} alt={u.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-blue-200 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-bold">
                      {u.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm text-slate-700 dark:text-slate-200">{u.name}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedIds.length < 2 || loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
}
