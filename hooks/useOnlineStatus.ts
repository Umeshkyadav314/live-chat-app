/**
 * useOnlineStatus — Tracks and syncs user online/offline presence
 * ---------------------------------------------------------------
 * Uses browser's Page Visibility API + beforeunload event.
 * 
 * - Sets user online when app is visible/focused
 * - Sets user offline when tab is hidden or window closes
 * - Updates in real-time so other users see the green dot appear/disappear
 *
 * Usage:
 *   useOnlineStatus({ clerkId: user.id });  // in ChatLayoutClient
 */

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

interface UseOnlineStatusProps {
  clerkId: string | null | undefined;
}

export function useOnlineStatus({ clerkId }: UseOnlineStatusProps) {
  const setOnlineStatus = useMutation(api.users.setOnlineStatus);

  useEffect(() => {
    if (!clerkId) return;

    // Mark online when component mounts
    setOnlineStatus({ clerkId, isOnline: true });

    const handleVisibilityChange = () => {
      setOnlineStatus({
        clerkId,
        isOnline: document.visibilityState === "visible",
      });
    };

    const handleBeforeUnload = () => {
      // Best-effort: may not always fire but works in most browsers
      setOnlineStatus({ clerkId, isOnline: false });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Mark offline when component unmounts (user logs out / navigates away)
      setOnlineStatus({ clerkId, isOnline: false });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [clerkId, setOnlineStatus]);
}
