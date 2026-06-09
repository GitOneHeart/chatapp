import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";

// 配置 DeepSeek（兼容 OpenAI 格式）
const deepseek = createOpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // UIMessage（parts 格式）→ ModelMessage（content 格式）
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: deepseek.chat("deepseek-chat"), // 注意：用 .chat() 走 /chat/completions，而不是默认的 /responses
      messages: modelMessages,
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
