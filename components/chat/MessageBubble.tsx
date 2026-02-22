"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { formatMessageTime } from "@/lib/dateUtils";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];

interface MessageBubbleProps {
  message: {
    _id: Id<"messages">;
    _creationTime: number;
    senderId: string;
    content: string;
    isDeleted: boolean;
    editedAt?: number;
    reactions?: Record<string, string[]>;
  };
  isOwn: boolean;
  currentUserId: string;
}

export default function MessageBubble({ message, isOwn, currentUserId }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  const deleteMessage = useMutation(api.messages.deleteMessage);
  const editMessage = useMutation(api.messages.editMessage);
  const toggleReaction = useMutation(api.messages.toggleReaction);

  const handleDelete = async () => {
    await deleteMessage({ messageId: message._id, senderId: currentUserId });
    setShowDeleteConfirm(false);
  };

  const handleEdit = async () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== message.content) {
      await editMessage({
        messageId: message._id,
        senderId: currentUserId,
        content: trimmed,
      });
    }
    setIsEditing(false);
    setEditText(message.content);
  };

  const handleReaction = async (emoji: string) => {
    await toggleReaction({ messageId: message._id, userId: currentUserId, emoji });
    setShowReactions(false);
  };

  const reactions = message.reactions ?? {};
  const hasReactions = Object.keys(reactions).length > 0;
  const isEdited = !!message.editedAt;

  return (
    <div
      className={`group flex gap-2 mb-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      onMouseLeave={() => setShowReactions(false)}
    >
      <div className={`relative max-w-[70%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {message.isDeleted ? (
          <div className="px-4 py-2 rounded-2xl text-sm italic text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
            This message was deleted
          </div>
        ) : isEditing ? (
          <div className="w-full">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleEdit();
                }
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditText(message.content);
                }
              }}
              className="w-full px-4 py-2.5 rounded-2xl text-sm bg-white dark:bg-slate-800 border-2 border-blue-500 text-slate-800 dark:text-slate-100 focus:outline-none resize-none"
              rows={2}
              autoFocus
            />
            <div className="flex gap-2 mt-1 justify-end">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditText(message.content);
                }}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={!editText.trim() || editText.trim() === message.content}
                className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
              isOwn
                ? "bg-blue-600 text-white rounded-br-sm"
                : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-sm"
            }`}
          >
            {message.content}
          </div>
        )}

        {hasReactions && !message.isDeleted && !isEditing && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(reactions).map(([emoji, reactors]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`flex items-center gap-1 text-xs rounded-full px-2 py-0.5 border transition-colors ${
                  reactors.includes(currentUserId)
                    ? "bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300"
                    : "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                <span>{emoji}</span>
                <span>{reactors.length}</span>
              </button>
            ))}
          </div>
        )}

        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 px-1 flex items-center gap-1.5">
          {formatMessageTime(message._creationTime)}
          {isEdited && (
            <span className="italic text-slate-400 dark:text-slate-500">edited</span>
          )}
        </span>

        {!message.isDeleted && !isEditing && (
          <div className={`absolute -top-7 ${isOwn ? "right-0" : "left-0"} hidden group-hover:flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg px-2 py-1`}>
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="text-slate-500 hover:text-blue-600 transition-colors p-0.5 text-sm"
              title="React"
            >
              😊
            </button>
            {isOwn && (
              <>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditText(message.content);
                  }}
                  className="text-slate-500 hover:text-blue-600 transition-colors p-0.5"
                  title="Edit"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-slate-500 hover:text-red-500 transition-colors p-0.5"
                  title="Delete"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}

        {showReactions && !message.isDeleted && !isEditing && (
          <div className={`absolute -top-14 ${isOwn ? "right-0" : "left-0"} flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl shadow-xl px-3 py-2 z-10`}>
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="text-xl hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl max-w-xs mx-4 border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Delete Message?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              This will show &quot;This message was deleted&quot; to everyone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
