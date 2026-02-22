/**
 * useTypingIndicator — Custom hook for typing detection
 * ------------------------------------------------------
 * Handles:
 * - Calling setTyping(true) when user starts typing
 * - Calling setTyping(false) after 2 seconds of inactivity
 * - Calling setTyping(false) when message is sent
 * - Cleanup on component unmount
 *
 * Usage:
 *   const { handleTypingChange, clearTyping } = useTypingIndicator({
 *     conversationId, userId, userName
 *   });
 */

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCallback, useRef } from "react";

interface UseTypingIndicatorProps {
  conversationId: Id<"conversations">;
  userId: string;
  userName: string;
}

export function useTypingIndicator({
  conversationId,
  userId,
  userName,
}: UseTypingIndicatorProps) {
  const setTyping = useMutation(api.typing.setTyping);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const clearTyping = useCallback(() => {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      setTyping({ conversationId, userId, userName, isTyping: false });
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [conversationId, userId, userName, setTyping]);

  const handleTypingChange = useCallback(
    (value: string) => {
      if (!value.trim()) {
        clearTyping();
        return;
      }

      // Start typing if not already
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        setTyping({ conversationId, userId, userName, isTyping: true });
      }

      // Reset the 2-second inactivity timer
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(clearTyping, 2000);
    },
    [conversationId, userId, userName, setTyping, clearTyping]
  );

  return { handleTypingChange, clearTyping };
}
