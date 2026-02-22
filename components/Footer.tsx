import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-500">
        <span>© {new Date().getFullYear()} TarsChat · Real-time messaging</span>
        <div className="flex gap-4">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Home
          </Link>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span>Secure by Clerk & Convex</span>
        </div>
      </div>
    </footer>
  );
}
