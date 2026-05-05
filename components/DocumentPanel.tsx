"use client";

import { Textarea } from "@/components/ui/textarea";
import { FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  document: string;
  setDocument: (val: string) => void;
};

export default function DocumentPanel({ document, setDocument }: Props) {
  return (
    <div className="flex flex-col h-full bg-card min-h-0">
      <div className="px-4 py-2 border-b flex items-center justify-between bg-muted/30 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-[10px] sm:text-xs tracking-tight uppercase">Document</h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setDocument("")}
          disabled={!document}
          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all active:scale-90"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex-1 p-2 sm:p-4 relative overflow-hidden flex flex-col min-h-[120px] lg:min-h-0">
        <div className="absolute top-1 right-2 text-[8px] sm:text-[9px] font-mono text-muted-foreground pointer-events-none z-10 bg-background/80 px-1.5 py-0.5 rounded border backdrop-blur-sm uppercase">
          {document ? `${document.length} chars` : "Empty"}
        </div>
        
        <Textarea
          className="flex-1 min-h-0 resize-none border-none focus-visible:ring-0 p-1 sm:p-4 text-xs sm:text-sm leading-relaxed bg-transparent scrollbar-thin"
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          placeholder="Paste content..."
        />
        
        {!document && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-muted-foreground/30 space-y-1 p-2 text-center">
            <FileText className="w-6 h-6 sm:w-10 sm:h-10 stroke-[1px]" />
            <p className="text-[10px] sm:text-sm">Content required</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t bg-muted/10">
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground overflow-hidden whitespace-nowrap">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={document ? "w-2 h-2 rounded-full bg-green-500 animate-pulse" : "w-2 h-2 rounded-full bg-orange-500"} />
            {document ? "READY FOR QUERY" : "WAITING FOR INPUT"}
          </div>
          <div className="h-3 w-px bg-border shrink-0" />
          <span className="truncate italic">Context will be used for AI responses</span>
        </div>
      </div>
    </div>
  );
}