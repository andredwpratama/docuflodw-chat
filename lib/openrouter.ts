import OpenAI from "openai";

export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function chatWithAI(message: string) {
  const res = await openrouter.chat.completions.create({
    model: "minimax/minimax-m2.5:free",
    messages: [
      { role: "user", content: message },
    ],
  });

  return res.choices[0].message.content;
}