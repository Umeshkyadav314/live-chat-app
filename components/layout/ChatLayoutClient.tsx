"use client";

/**
 * ChatLayoutClient
 * ----------------
 * The main client-side shell of the chat app.
 * Responsibilities:
 *  1. Sync the current user's profile to Convex on login
 *  2. Track online/offline presence using custom hook
 *  3. Handle responsive layout (sidebar vs full-screen chat on mobile)
 */

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import Sidebar from "./Sidebar";
import { Footer } from "@/components/Footer";

export default function ChatLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const upsertUser = useMutation(api.users.upsertUser);
  const [isMobileConvoOpen, setIsMobileConvoOpen] = useState(false);

  // ── Sync user profile to Convex ──────────────────────────────────────────
  // Every time the user object changes (name update, avatar update, etc.)
  // we push the latest data to Convex so other users see updated info.
  useEffect(() => {
    if (!user) return;

    upsertUser({
      clerkId: user.id,
      name:
        user.fullName ||
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
        user.username ||
        "Anonymous",
      email: user.primaryEmailAddress?.emailAddress ?? "",
      imageUrl: user.imageUrl || undefined,
    });
  }, [user, upsertUser]);

  // ── Online / Offline presence tracking ──────────────────────────────────
  // Custom hook handles visibility API + beforeunload events
  useOnlineStatus({ clerkId: user?.id });

  // ── Loading state ────────────────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {[0, 150, 300].map((delay) => (
              <div
                key={delay}
                className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-sm">Loading TarsChat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white dark:bg-slate-900">
      <div className="flex flex-1 min-h-0">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <div
          className={`
            w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-slate-200 dark:border-slate-700
            ${isMobileConvoOpen ? "hidden md:flex" : "flex"}
            flex-col
          `}
        >
          <Sidebar onConversationOpen={() => setIsMobileConvoOpen(true)} />
        </div>

        {/* ── Chat area ───────────────────────────────────────────────────── */}
        <div
          className={`
            flex-1 flex flex-col min-w-0
            ${isMobileConvoOpen ? "flex" : "hidden md:flex"}
          `}
        >
          {isMobileConvoOpen && (
            <div className="md:hidden px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center">
              <button
                onClick={() => setIsMobileConvoOpen(false)}
                className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
