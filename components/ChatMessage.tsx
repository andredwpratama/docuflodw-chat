"use client";

type Props = {
  message: {
    id: string;
    role: "user" | "assistant";
    content: string;
  };
};

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={isUser ? "text-right" : "text-left"}>
      <span>{message.content}</span>
    </div>
  );
}