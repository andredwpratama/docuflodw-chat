export type ChatMessageType = {
  id: string;
  role: "user" | "assistant";
  content: string;
};