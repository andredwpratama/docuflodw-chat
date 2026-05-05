import OpenAI from "openai";

export async function GET() {
    try {
        const client = new OpenAI({
            apiKey: process.env.OPENROUTER_API_KEY!,
            baseURL: "https://openrouter.ai/api/v1",
        });

        const res = await client.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages: [
                { role: "user", content: "Hello dari Next.js" },
            ],
        });

        return Response.json({
            success: true,
            data: res.choices[0].message.content,
        });
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Unexpected error";

        return Response.json({
            success: false,
            error: message,
        });
    }
}