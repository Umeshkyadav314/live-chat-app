"use client";

export default function ChatHomePage() {
  return (
    <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-center p-8">
      <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
        <svg className="w-10 h-10 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Your Messages</h2>
      <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs">
        Select a conversation from the sidebar or search for a user to start chatting.
      </p>
    </div>
  );
}
