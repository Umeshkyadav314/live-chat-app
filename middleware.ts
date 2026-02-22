/**
 * Next.js Middleware — Route Protection
 * --------------------------------------
 * Protects all routes except public ones.
 * Unauthenticated users are redirected to /sign-in automatically.
 * 
 * Public routes (no login needed):
 *  - /sign-in  → Clerk's login page
 *  - /sign-up  → Clerk's registration page
 *  - /api/webhooks/* → Clerk webhook (verified by Svix signature, not session)
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware((auth, req) => {
  // If it's not a public route, require authentication
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  // Run middleware on all routes except static files and Next.js internals
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
