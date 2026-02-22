"use client";

import ChatWindow from "@/components/chat/ChatWindow";

export default function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const { conversationId } = params;
  return <ChatWindow conversationId={conversationId} />;
}
