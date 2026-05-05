"use client";

import { useState } from "react";
import DocumentPanel from "@/components/DocumentPanel";
import ChatPanel from "@/components/ChatPanel";

export default function Home() {
  const [document, setDocument] = useState("");

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-1/2">
        <DocumentPanel document={document} setDocument={setDocument} />
      </div>

      <div className="w-full md:w-1/2">
        <ChatPanel document={document} />
      </div>
    </div>
  );
}