"use client";

import { useState, useEffect, useRef } from "react";
import DocumentPanel from "@/components/DocumentPanel";
import ChatPanel from "@/components/ChatPanel";
import { Card } from "@/components/ui/card";
import gsap from "gsap";

export default function Home() {
  const [document, setDocument] = useState("");
  const headerRef = useRef<HTMLElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const onHover = (el: HTMLDivElement | null, entering: boolean) => {
    if (!el) return;
    gsap.to(el, {
      y: entering ? -4 : 0,
      scale: entering ? 1.005 : 1,
      boxShadow: entering 
        ? "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" 
        : "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      borderColor: entering ? "rgba(var(--primary), 0.3)" : "rgba(var(--border), 0.5)",
      duration: 0.3,
      ease: "power2.out"
    });
  };

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(headerRef.current, 
      { y: -100, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: "power4.out" }
    );
    
    tl.fromTo([leftPanelRef.current, rightPanelRef.current],
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" },
      "-=0.4"
    );
  }, []);

  return (
    <main className="min-h-screen lg:h-screen bg-background flex flex-col selection:bg-primary/10 lg:overflow-hidden">
      {/* Header */}
      <header 
        ref={headerRef}
        className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-10 shadow-sm"
      >
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300">
              D
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight leading-none group-hover:text-primary transition-colors duration-300">DocuFlow</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-muted-foreground flex items-center gap-2 px-2 py-1 rounded-full hover:bg-muted/50 transition-colors cursor-help">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="hidden sm:inline font-medium">Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 container mx-auto p-2 sm:p-4 md:p-6 lg:p-8 overflow-y-auto lg:overflow-hidden">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-8 h-full min-h-0">
          {/* Document Panel */}
          <div 
            ref={leftPanelRef} 
            className="shrink-0 lg:h-full min-h-[150px] lg:min-h-0"
            onMouseEnter={() => onHover(leftPanelRef.current, true)}
            onMouseLeave={() => onHover(leftPanelRef.current, false)}
          >
            <Card className="h-full flex flex-col overflow-hidden border-2 border-border/50 shadow-xl shadow-black/5 bg-card/50">
              <DocumentPanel document={document} setDocument={setDocument} />
            </Card>
          </div>

          {/* Chat Panel */}
          <div 
            ref={rightPanelRef} 
            className="flex-1 lg:h-full min-h-[400px] lg:min-h-0"
            onMouseEnter={() => onHover(rightPanelRef.current, true)}
            onMouseLeave={() => onHover(rightPanelRef.current, false)}
          >
            <Card className="h-full flex flex-col overflow-hidden border-2 border-border/50 shadow-xl shadow-black/5 bg-card/50">
              <ChatPanel document={document} />
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-2 border-t bg-muted/5">
        <div className="container mx-auto px-4 flex items-center justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          <p>© 2026 DocuFlow</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary transition-colors">Security</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </main>
  );
}