import { ragChat } from "@/lib/rag-chat";
import { redis } from "@/lib/redis";
import { ChatWrappter } from "../components/ChatWrappter";
import { cookies } from "next/headers";

interface PageProps {
  params: {
    url: string[] | string | undefined;
  };
}

function reconstructUlr({ url }: { url: string[] }) {
  const decodeComponents = url.map((component) =>
    decodeURIComponent(component)
  );
  return decodeComponents.join("/");
}

const Page = async ({ params }: PageProps) => {
  const sessionCookie = (await cookies()).get("sessionId")?.value;

  const paramsResolved = await params;
  const reconstructUrl = reconstructUlr({
    url: paramsResolved.url as string[],
  });

  const sessionId = (reconstructUlr + "--" + sessionCookie).replace(/\//g, "");

  const isAlreadyIndexed = await redis.sismember(
    "indexed-urls",
    reconstructUrl
  );

  const initialMessages = await ragChat.history.getMessages({
    amount: 10,
    sessionId,
  });

  if (!isAlreadyIndexed) {
    await ragChat.context.add({
      type: "html",
      source: reconstructUrl,
      config: { chunkOverlap: 50, chunkSize: 200 },
    });

    await redis.sadd("indexed-urls", reconstructUrl);
  }

  return (
    <ChatWrappter sessionId="{sessionId}" initialMessages={initialMessages} />
  );
};
export default Page;
