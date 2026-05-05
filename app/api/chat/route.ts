import { chatWithAI } from "@/lib/openrouter";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await chatWithAI(body.messages);

    return Response.json({ result });
  } catch (err: unknown) {
    return Response.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}