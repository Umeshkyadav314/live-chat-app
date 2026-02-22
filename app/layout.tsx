/**
 * Root Layout
 * -----------
 * Wraps the entire app with:
 *  1. ClerkProvider — handles auth state, Google login, email login
 *  2. ConvexClientProvider — connects to Convex backend with Clerk JWT
 * 
 * Google Login Setup (in Clerk Dashboard):
 *  1. Go to Clerk Dashboard → Social Connections
 *  2. Enable "Google"
 *  3. Add your Google OAuth credentials (Client ID + Secret)
 *     from Google Cloud Console → APIs & Services → Credentials
 *  4. That's it! The SignIn component automatically shows "Continue with Google"
 */

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "TarsChat – Real-time Messaging",
  description: "Connect and chat with your team in real time",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ClerkProvider
            appearance={{
              layout: {
                unsafe_disableDevelopmentModeWarnings: true,
              },
            }}
          >
            <ConvexClientProvider>
              {children}
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
