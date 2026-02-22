import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();

  // If already logged in, redirect to chat
  if (userId) {
    redirect("/chat");
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      {/* Hero / Landing */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-8 shadow-xl">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
            />
          </svg>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
          TarsChat
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-md mb-2">
          Real-time messaging, simplified.
        </p>
        <p className="text-slate-500 dark:text-slate-500 text-sm mb-10 max-w-sm">
          Connect with your team instantly. Direct messages, group chats, typing indicators & more.
        </p>

        {/* CTA */}
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          Start Chatting
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        <p className="mt-6 text-sm text-slate-500 dark:text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-500">
          <span>© {new Date().getFullYear()} TarsChat. Real-time messaging.</span>
          <div className="flex gap-6">
            <Link href="/sign-in" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
