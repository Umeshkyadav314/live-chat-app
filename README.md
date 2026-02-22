# TarsChat — Real-time Chat App 💬

Built with **Next.js 14**, **TypeScript**, **Convex**, and **Clerk**.

## ✅ Features Implemented

| # | Feature | Status |
|---|---------|--------|
| 1 | Authentication (email + Google login) | ✅ |
| 2 | User List & Search (real-time filter) | ✅ |
| 3 | One-on-One Direct Messages | ✅ |
| 4 | Message Timestamps (smart format) | ✅ |
| 5 | Empty States (all screens) | ✅ |
| 6 | Responsive Layout (mobile + desktop) | ✅ |
| 7 | Online/Offline Status (real-time) | ✅ |
| 8 | Typing Indicator (auto-clears 2s) | ✅ |
| 9 | Unread Message Count (badge) | ✅ |
| 10 | Smart Auto-Scroll (↓ New messages) | ✅ |
| 11 | Delete Own Messages (soft delete) | ✅ |
| 12 | Message Reactions (👍❤️😂😮😢) | ✅ |
| 13 | Loading & Error States (skeletons + retry) | ✅ |
| 14 | Group Chat (create, real-time) | ✅ |

---

## 🚀 Setup Guide (Step by Step)

### Step 1 — Clone and install
```bash
git clone <your-repo>
cd tars-chat-app
npm install
```

### Step 2 — Set up Convex
```bash
npx convex dev
```
- This creates your Convex project and generates `convex/_generated/`
- Copy the `NEXT_PUBLIC_CONVEX_URL` it shows you

### Step 3 — Set up Clerk

1. Go to [clerk.com](https://clerk.com) → Create new application
2. **Enable Google Login:**
   - Clerk Dashboard → Social Connections → Google → Enable
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - APIs & Services → Credentials → Create OAuth 2.0 Client ID
   - Add redirect URI: `https://accounts.clerk.dev/v1/oauth_callback`
   - Paste Client ID + Secret into Clerk
3. Copy your `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

### Step 4 — Link Clerk to Convex (JWT)

1. In Clerk Dashboard → **JWT Templates** → New Template → **Convex**
2. Copy the **Issuer URL** (e.g. `https://your-app.clerk.accounts.dev`)
3. In [Convex Dashboard](https://dashboard.convex.dev) → Settings → Environment Variables:
   - Add `CLERK_JWT_ISSUER_DOMAIN` = your Issuer URL

### Step 5 — Set up Clerk Webhook (for user history sync)

1. Clerk Dashboard → **Webhooks** → Add Endpoint
2. URL: `https://your-domain.com/api/webhooks/clerk`
3. Enable events: `user.created`, `user.updated`, `user.deleted`
4. Copy the **Signing Secret** → add as `CLERK_WEBHOOK_SECRET` in `.env.local`

> For local dev: use [ngrok](https://ngrok.com) or [Clerk dev webhook](https://clerk.com/docs/integrations/webhooks/overview)

### Step 6 — Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your Clerk keys, Convex URL, and webhook secret (see `.env.example` for descriptions).

### Step 7 — Run the app
```bash
# Terminal 1 — Next.js
npm run dev

# Terminal 2 — Convex (keep this running!)
npx convex dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
/app
  /sign-in          → Clerk login page (email + Google)
  /sign-up          → Clerk registration page
  /chat             → Protected chat layout + pages
    /[conversationId] → Individual chat window
  /api/webhooks/clerk → Webhook: syncs user history to Convex

/components
  /layout
    ChatLayoutClient  → Syncs user to Convex, handles presence + layout
    Sidebar           → Conversation list, search, user list, group creation
  /chat
    ChatWindow        → Messages display + auto-scroll logic
    ChatHeader        → Other user's name/avatar/online status
    MessageBubble     → Individual message with reactions + delete
    MessageInput      → Text input with typing indicator + error retry
    TypingIndicator   → Animated dots "X is typing..."

/convex (backend)
  schema.ts         → Database tables: users, conversations, messages, readReceipts, typingIndicators
  users.ts          → upsertUser, setOnlineStatus, deleteUser, getAllUsers, getUserByClerkId
  conversations.ts  → getOrCreateDirect, createGroup, getMyConversations
  messages.ts       → sendMessage, getMessages, deleteMessage, toggleReaction
  readReceipts.ts   → markAsRead, getUnreadCounts, getUnreadCount
  typing.ts         → setTyping, getTypingUsers
  auth.config.ts    → Clerk JWT trust configuration

/hooks
  useTypingIndicator.ts  → Typing detection + 2s auto-clear
  useOnlineStatus.ts     → Page visibility API + beforeunload

/lib
  dateUtils.ts      → Smart timestamp formatting
  types.ts          → Shared TypeScript interfaces (User, Conversation, Message, etc.)
```

---

## 🏗️ Schema Design

```
users          → clerkId (PK), name, email, imageUrl, isOnline, lastSeen
conversations  → type (direct/group), participantIds[], groupName?, lastMessageTime
messages       → conversationId (FK), senderId, content, isDeleted, reactions{}
readReceipts   → conversationId, userId, lastReadTime  [for unread counts]
typingIndicators → conversationId, userId, userName, lastTypedAt  [ephemeral]
```
