"use client";

/**
 * ConvexClientProvider
 * --------------------
 * Wraps the app with both Convex AND Clerk auth together.
 * useAuth() from Clerk gives Convex a JWT token so every
 * Convex query/mutation knows which user is making the request.
 * This is the key bridge between Clerk (auth) and Convex (backend).
 */

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";

// Single Convex client instance for the whole app
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    // ConvexProviderWithClerk automatically passes Clerk's JWT
    // to every Convex request — no manual token handling needed
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
