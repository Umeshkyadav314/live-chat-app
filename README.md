# TarsChat — Real-time Chat App 💬

A full-stack real-time messaging app built for the **Tars Full Stack Engineer Internship 2026**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| **Auth** | Clerk (email, Google OAuth) |
| **Backend & Realtime** | Convex |
| **Styling** | Tailwind CSS, next-themes (light/dark mode) |
| **Icons** | Lucide React |
| **Dates** | date-fns |

---

## ✅ Features

| # | Feature | Status |
|---|---------|--------|
| 1 | Authentication (email + Google login) | ✅ |
| 2 | User list & search (real-time filter) | ✅ |
| 3 | One-on-one direct messages | ✅ |
| 4 | Message timestamps (smart format) | ✅ |
| 5 | Empty states (all screens) | ✅ |
| 6 | Responsive layout (mobile + desktop) | ✅ |
| 7 | Online/offline status (real-time) | ✅ |
| 8 | Typing indicator (auto-clears 2s) | ✅ |
| 9 | Unread message count (badge) | ✅ |
| 10 | Smart auto-scroll (↓ new messages) | ✅ |
| 11 | Delete own messages | ✅ |
| 12 | Message reactions | ✅ |
| 13 | Loading & error states | ✅ |
| 14 | Group chat | ✅ |

---

## 🚀 Setup Guide (Step by Step)

### Step 1 — Clone and install

```bash
git clone <your-repo-url>
cd live-chat-app
npm install
```

### Step 2 — Set up Convex

1. Run:
   ```bash
   npx convex dev
   ```
2. Sign in or create a Convex account.
3. Follow the prompts to create a new project.
4. Copy the `NEXT_PUBLIC_CONVEX_URL` shown in the terminal.

### Step 3 — Set up Clerk

1. Go to [clerk.com](https://clerk.com) → **Create application**.
2. Enable **Google Login:**
   - Clerk Dashboard → **Social Connections** → **Google** → Enable.
   - Go to [Google Cloud Console](https://console.cloud.google.com).
   - **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**.
   - Application type: **Web application**.
   - Add redirect URI: `https://accounts.clerk.dev/v1/oauth_callback`.
   - Copy **Client ID** and **Client Secret** → paste into Clerk.
3. Copy from Clerk Dashboard → **API Keys**:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### Step 4 — Link Clerk to Convex (JWT)

1. In Clerk Dashboard → **JWT Templates** → **New template** → **Convex**.
2. Copy the **Issuer URL** (e.g. `https://your-app.clerk.accounts.dev`).
3. In [Convex Dashboard](https://dashboard.convex.dev) → your project → **Settings** → **Environment Variables**.
4. Add: `CLERK_JWT_ISSUER_DOMAIN` = your Issuer URL.

### Step 5 — Set up Clerk webhook (user sync)

1. Clerk Dashboard → **Webhooks** → **Add Endpoint**.
2. **Endpoint URL:** `https://your-domain.com/api/webhooks/clerk`
   - For local dev, use [ngrok](https://ngrok.com) or Clerk’s dev webhook.
3. Enable events: `user.created`, `user.updated`, `user.deleted`.
4. Copy the **Signing Secret** → you’ll use it in `.env.local` as `CLERK_WEBHOOK_SECRET`.

### Step 6 — Environment variables

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```
2. Edit `.env.local` and fill in:

   | Variable | Where to get it |
   |----------|-----------------|
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk → API Keys |
   | `CLERK_SECRET_KEY` | Clerk → API Keys |
   | `NEXT_PUBLIC_CONVEX_URL` | Output of `npx convex dev` |
   | `CLERK_WEBHOOK_SECRET` | Clerk → Webhooks → Signing Secret |

3. Optional Clerk URLs (defaults are fine if you skip these):

   ```
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat
   ```

   `CLERK_JWT_ISSUER_DOMAIN` is set in Convex, not in `.env.local`.

### Step 7 — Run the app

Use two terminals:

**Terminal 1 — Next.js:**
```bash
npm run dev
```

**Terminal 2 — Convex (keep running):**
```bash
npx convex dev
```

Then open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
app/
  page.tsx                 → Landing page
  layout.tsx               → Root layout (Clerk, Convex, Theme)
  sign-in/[[...sign-in]]/  → Sign-in page
  sign-up/[[...sign-up]]/  → Sign-up page
  chat/                    → Protected chat
    page.tsx               → Redirect / new chat
    [conversationId]/      → Chat window
  api/webhooks/clerk/      → User sync webhook

components/
  layout/
    ChatLayoutClient.tsx   → Sidebar + chat area
    Sidebar.tsx            → Conversations, search, users
  chat/
    ChatWindow.tsx         → Messages + auto-scroll
    ChatHeader.tsx         → Header for active chat
    MessageBubble.tsx      → Single message
    MessageInput.tsx       → Input + typing
    TypingIndicator.tsx
  ThemeProvider.tsx
  ThemeToggle.tsx
  Footer.tsx

convex/
  schema.ts                → Tables: users, conversations, messages, etc.
  users.ts                 → User CRUD, online status
  conversations.ts         → Direct/group chats
  messages.ts              → Send, delete, reactions
  readReceipts.ts          → Unread counts
  typing.ts                → Typing indicators
  auth.config.ts           → Clerk JWT config

hooks/
  useTypingIndicator.ts
  useOnlineStatus.ts

lib/
  dateUtils.ts             → Timestamp formatting
  types.ts                 → Shared types
```

---

## 🏗️ Schema (Convex)

| Table | Purpose |
|-------|---------|
| `users` | `clerkId`, name, email, image, online status |
| `conversations` | `type` (direct/group), participants, last message time |
| `messages` | content, sender, reactions, delete flag |
| `readReceipts` | last read time per user/conversation |
| `typingIndicators` | who is typing (ephemeral) |

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run lint` | Run ESLint |
| `npx convex dev` | **Required:** Syncs Convex functions (messages, edit, etc.). Keep running in a separate terminal. |

> **If you see "Could not find public function for 'messages:editMessage'"** — run `npx convex dev` in a separate terminal and leave it running. It deploys your Convex functions to the backend.
