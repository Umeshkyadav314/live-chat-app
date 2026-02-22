import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatLayoutClient from "@/components/layout/ChatLayoutClient";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return <ChatLayoutClient>{children}</ChatLayoutClient>;
}
