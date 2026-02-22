"use client";

/**
 * MessageInput
 * ------------
 * The chat input bar at the bottom of the chat window.
 * Features:
 *  - Auto-expanding textarea (up to 5 lines)
 *  - Enter to send, Shift+Enter for new line
 *  - Typing indicator via useTypingIndicator hook
 *  - Error state with retry button
 *  - Loading spinner while sending
 */

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useRef } from "react";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";

interface MessageInputProps {
  conversationId: Id<"conversations">;
  currentUserId: string;
  currentUserName: string;
  onMessageSent: () => void;
}

export default function MessageInput({
  conversationId,
  currentUserId,
  currentUserName,
  onMessageSent,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = useMutation(api.messages.sendMessage);

  // Custom hook manages typing indicator state + auto-clear after 2s
  const { handleTypingChange, clearTyping } = useTypingIndicator({
    conversationId,
    userId: currentUserId,
    userName: currentUserName,
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    // Auto-expand textarea height
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 128) + "px";
    }

    // Notify typing indicator hook
    handleTypingChange(e.target.value);
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || !currentUserId) return;

    setError(null);
    setSending(true);
    clearTyping(); // Stop typing indicator immediately

    try {
      await sendMessage({
        conversationId,
        senderId: currentUserId,
        content: trimmed,
      });

      setText("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      onMessageSent(); // Scroll to bottom
    } catch (err) {
      setError("Failed to send message. Click to retry.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter = send, Shift+Enter = newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
      {/* Error state with retry */}
      {error && (
        <div
          onClick={handleSend}
          className="flex items-center gap-2 text-xs text-red-500 mb-2 cursor-pointer hover:text-red-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error} (tap to retry)
        </div>
      )}

      <div className="flex items-end gap-3">
        {/* Auto-expanding textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send)"
          rows={1}
          disabled={sending}
          className="
            flex-1 resize-none bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-2.5
            text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800
            transition-all max-h-32 overflow-y-auto leading-relaxed
            disabled:opacity-60
          "
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending || !currentUserId}
          className="
            flex-shrink-0 w-10 h-10
            bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600
            disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed
            text-white rounded-full flex items-center justify-center
            transition-all shadow-md hover:shadow-lg
          "
          title="Send message"
        >
          {sending ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
