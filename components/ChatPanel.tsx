"use client";

import { useState, useEffect, useRef } from "react";
import ChatMessage from "@/components/ChatMessage";

type ChatMessageType = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Props = {
  document: string;
};

export default function ChatPanel({ document }: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const tokenCount = Math.ceil(document.length / 4);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ======================
  // ⚡ INSTANT EXTRACT
  // ======================
  function instantExtract(doc: string, question: string): string | null {
    const lines = doc.split("\n");
    const q = question.toLowerCase();

    for (const line of lines) {
      const lower = line.toLowerCase();

      // simple keyword match
      if (q.includes("name") && lower.includes("name")) {
        return line.split(" ").slice(-1)[0];
      }

      if (q.includes("live") && lower.includes("live")) {
        return line.split("in")[1]?.trim();
      }

      if (q.includes("color") && lower.includes("color")) {
        return line.split("is")[1]?.trim();
      }

      // fallback keyword match
      if (lower.includes(q)) {
        return line;
      }
    }

    return null;
  }

  // ======================
  // 🧠 RAG HELPERS
  // ======================
  function splitDocument(text: string, chunkSize = 300) {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  function findRelevantChunks(chunks: string[], query: string) {
    const q = query.toLowerCase();

    return chunks
      .map((chunk) => ({
        chunk,
        score: chunk.toLowerCase().includes(q) ? 1 : 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((c) => c.chunk);
  }

  // ======================
  // 🚀 HANDLE SUBMIT
  // ======================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!document.trim()) {
      alert("Paste document first");
      return;
    }

    if (!input.trim()) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    // ======================
    // ⚡ SHORT MODE (INSTANT)
    // ======================
    if (!thinking) {
      const instant = instantExtract(document, input);

      const aiMsg: ChatMessageType = {
        id: Date.now().toString(),
        role: "assistant",
        content: instant ?? "not found",
      };

      setMessages((prev) => [...prev, aiMsg]);

      setLoading(false);
      return; // 🔥 STOP TOTAL (NO API EVER)
    }

    // ======================
    // 🧠 THINKING MODE (RAG)
    // ======================
    let context = "";

    if (thinking) {
      const chunks = splitDocument(document, 300);
      const relevant = findRelevantChunks(chunks, input);
      context = relevant.join("\n");
    }

    const shortDoc = document.slice(0, 600);

    const systemMessage = {
      role: "system",
      content: thinking
        ? `
You are a document-based assistant.

Rules:
- Answer ONLY using the provided context
- Be concise
- If not found: not found

Context:
${context}
`
        : `
Extract answer ONLY from the document.

Rules:
- Max 3 words
- No explanation
- If not found: not found

Document:
${shortDoc}
`,
    };

    const requestMessages = thinking
      ? [systemMessage, ...messages, userMessage]
      : [systemMessage, userMessage];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: requestMessages }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();

      const clean =
        data.result?.split("\n")[0].trim() || "not found";

      const aiMessage: ChatMessageType = {
        id: Date.now().toString() + "-ai",
        role: "assistant",
        content: clean,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setError("AI failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full p-4 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold">Chat</h2>

        <button
          onClick={() => setThinking((prev) => !prev)}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          {thinking ? "🧠 Thinking" : "⚡ Fast"}
        </button>
      </div>

      <p className="text-xs text-gray-400 mb-2">
        Tokens: ~{tokenCount}
      </p>

      {error && <div className="text-red-500">{error}</div>}

      <div className="flex-1 overflow-y-auto border p-2 mb-2">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {loading && <div>...</div>}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          disabled={!document.trim() || loading}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow border p-2"
          placeholder={
            !document.trim()
              ? "Paste document first..."
              : "Type..."
          }
        />

        <button disabled={!document.trim() || loading}>
          Send
        </button>
      </form>

      <button
        onClick={() => setMessages([])}
        className="text-sm mt-2"
      >
        Clear
      </button>
    </div>
  );
}