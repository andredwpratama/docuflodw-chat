"use client";

import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

type Props = {
  message: {
    id: string;
    role: "user" | "assistant";
    content: string;
  };
};

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageRef.current) {
      gsap.fromTo(
        messageRef.current,
        { opacity: 0, y: 10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }, []);

  return (
    <div 
      ref={messageRef}
      className={cn(
        "flex w-full mb-4 gap-2 sm:gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      )}>
        {isUser ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
      </div>
      
      <div className={cn(
        "max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 text-sm shadow-sm",
        isUser 
          ? "bg-primary text-primary-foreground rounded-tr-none" 
          : "bg-card border text-card-foreground rounded-tl-none"
      )}>
        <p className="leading-relaxed break-words">{message.content}</p>
      </div>
    </div>
  );
}