import { ragChat } from "@/lib/rag-chat";
import { aiUseChatAdapter } from "@upstash/rag-chat/nextjs";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const { messages, sessionId } = body;
  console.log(messages);

  const lastMessage = messages[messages.length - 1].content;

  const response = await ragChat.chat(lastMessage, {
    streaming: true,
    sessionId,
  });

  console.log("response", response);
  return aiUseChatAdapter(response);
};
