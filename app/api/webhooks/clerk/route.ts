/**
 * Clerk Webhook Handler
 * ---------------------
 * Clerk calls this endpoint whenever a user is created, updated, or deleted.
 * We use this to keep Convex's "users" table in sync with Clerk.
 * 
 * This ensures user profiles (name, email, avatar) are stored in Convex
 * so other users can discover and message them — even before they first
 * open the app.
 * 
 * Setup: In Clerk Dashboard → Webhooks → Add endpoint:
 *   URL: https://your-domain.com/api/webhooks/clerk
 *   Events: user.created, user.updated, user.deleted
 */

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("CLERK_WEBHOOK_SECRET is not set in environment variables");
  }

  // Get Svix headers for verification (security check)
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the webhook came from Clerk (not a fake request)
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid webhook signature", { status: 400 });
  }

  const eventType = evt.type;

  // ── user.created or user.updated ────────────────────────────────
  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, first_name, last_name, email_addresses, image_url } = evt.data;

    const name =
      [first_name, last_name].filter(Boolean).join(" ") ||
      email_addresses[0]?.email_address?.split("@")[0] ||
      "Anonymous";

    const email = email_addresses[0]?.email_address ?? "";

    // Upsert into Convex users table
    await convex.mutation(api.users.upsertUser, {
      clerkId: id,
      name,
      email,
      imageUrl: image_url ?? undefined,
    });

    console.log(`User ${eventType}: ${name} (${id})`);
  }

  // ── user.deleted ─────────────────────────────────────────────────
  if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      await convex.mutation(api.users.deleteUser, { clerkId: id });
      console.log(`User deleted: ${id}`);
    }
  }

  return new Response("Webhook processed", { status: 200 });
}
