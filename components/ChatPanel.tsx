"use client";

import { useState, useEffect, useRef } from "react";
import ChatMessage from "@/components/ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Sparkles, 
  Zap, 
  Eraser, 
  MessageSquare,
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  }, [messages, loading]);

  // ======================
  // ⚡ INSTANT EXTRACT (MOCK LOGIC - DO NOT TOUCH)
  // ======================
  function instantExtract(doc: string, question: string): string | null {
    const lines = doc.split("\n");
    const q = question.toLowerCase();

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (q.includes("name") && lower.includes("name")) return line.split(" ").slice(-1)[0];
      if (q.includes("live") && lower.includes("live")) return line.split("in")[1]?.trim();
      if (q.includes("color") && lower.includes("color")) return line.split("is")[1]?.trim();
      if (lower.includes(q)) return line;
    }
    return null;
  }

  // ======================
  // 🧠 RAG HELPERS (MOCK LOGIC - DO NOT TOUCH)
  // ======================
  function splitDocument(text: string, chunkSize = 300) {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) chunks.push(text.slice(i, i + chunkSize));
    return chunks;
  }

  function findRelevantChunks(chunks: string[], query: string) {
    const q = query.toLowerCase();
    return chunks
      .map((chunk) => ({ chunk, score: chunk.toLowerCase().includes(q) ? 1 : 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((c) => c.chunk);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document.trim()) return;
    if (!input.trim() || loading) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    if (!thinking) {
      const instant = instantExtract(document, input);
      setTimeout(() => {
        const aiMsg: ChatMessageType = {
          id: Date.now().toString(),
          role: "assistant",
          content: instant ?? "Information not found in the current document context.",
        };
        setMessages((prev) => [...prev, aiMsg]);
        setLoading(false);
      }, 600);
      return;
    }

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
        ? `You are a document-based assistant. Rules: - Answer ONLY using provided context - Be concise - If not found: not found\nContext:\n${context}`
        : `Extract answer ONLY from document. Rules: - Max 3 words - No explanation - If not found: not found\nDocument:\n${shortDoc}`,
    };

    const requestMessages = thinking
      ? [systemMessage, ...messages, userMessage]
      : [systemMessage, userMessage];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: requestMessages }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const clean = data.result?.split("\n")[0].trim() || "Information not found.";

      const aiMessage: ChatMessageType = {
        id: Date.now().toString() + "-ai",
        role: "assistant",
        content: clean,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setError("The AI assistant is currently unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Panel Header */}
      <div className="p-4 border-b flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm tracking-tight uppercase">AI Assistant</h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setThinking((prev) => !prev)}
            className={cn(
              "h-8 gap-1.5 transition-all duration-300 active:scale-95",
              thinking 
                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" 
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {thinking ? <Sparkles className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
            <span className="text-xs font-medium">{thinking ? "Deep Analysis" : "Fast Scan"}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMessages([])}
            disabled={messages.length === 0}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all active:scale-90"
          >
            <Eraser className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 min-h-0 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 min-h-[150px] sm:min-h-[200px]">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary/20" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-sm sm:text-base">No messages yet</h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground max-w-[200px]">
                Paste a document and ask a question to begin.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {loading && (
              <div className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-muted border flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
                <div className="bg-card border rounded-2xl rounded-tl-none px-4 py-2">
                  <div className="h-4 w-12 bg-muted rounded" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Error State */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20 flex items-center gap-2 text-destructive text-[11px]">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}

      {/* Input Area */}
      <div className="p-2 sm:p-4 border-t bg-muted/10">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            disabled={!document.trim() || loading}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={cn(
              "w-full bg-background border-2 rounded-lg sm:rounded-xl py-2 sm:py-3 pl-3 sm:pl-4 pr-10 sm:pr-12 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20",
              !document.trim() ? "opacity-50 cursor-not-allowed bg-muted/50" : "border-border group-focus-within:border-primary/50"
            )}
            placeholder={
              !document.trim()
                ? "Upload document..."
                : "Ask anything..."
            }
          />
          <Button 
            type="submit"
            size="icon"
            disabled={!document.trim() || !input.trim() || loading}
            className="absolute right-1 top-1 h-7 w-7 sm:h-9 sm:w-9 sm:right-1.5 sm:top-1.5 rounded-md sm:rounded-lg transition-transform active:scale-95"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </Button>
        </form>

        <div className="mt-2 sm:mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono py-0 h-5 border-muted-foreground/20">
              OKLCH ENGINE
            </Badge>
            <Badge variant="outline" className="text-[10px] font-mono py-0 h-5 border-muted-foreground/20">
              V1.0.4
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            ~{tokenCount} Context Tokens
          </p>
        </div>
      </div>
    </div>
  );
}