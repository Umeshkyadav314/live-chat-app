"use client";

interface TypingIndicatorProps {
  users: Array<{ userId: string; userName: string }>;
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const label =
    users.length === 1
      ? `${users[0].userName} is typing`
      : `${users.map((u) => u.userName).join(", ")} are typing`;

  return (
    <div className="flex items-center gap-2 px-2 py-1 animate-fade-in">
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-2xl px-3 py-2">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      <span className="text-xs text-slate-400 dark:text-slate-500">{label}</span>
    </div>
  );
}
