"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

const PROMPT_PROBES = [
  "What can I do in DPIS?",
  "How do I get pricing recommendations?",
  "Where do I add competitor prices?",
  "How does the pipeline work?",
  "Explain the Analytics page",
];

export function PlatformChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    },
    onError: (err) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I couldn’t complete that. ${err.message}. Make sure an LLM API key is configured (OPENAI_API_KEY or GEMINI_API_KEY).`,
        },
      ]);
    },
  });

  const handleSendMessage = (content: string) => {
    const newUserMessage: Message = { role: "user", content };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    chatMutation.mutate({
      messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
    });
  };

  return (
    <>
      {/* Toggle button — bottom right */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open platform guide"}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full shadow-lg transition-all",
          "bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
      >
        <MessageCircle className="size-6" />
      </button>

      {/* Chat panel — opens above the button */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col rounded-xl border bg-card shadow-xl"
          style={{ height: "min(560px, 70vh)" }}
        >
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="text-sm font-medium">Platform guide</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X className="size-4" />
            </Button>
          </div>
          <div className="flex-1 min-h-0">
            <AIChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={chatMutation.isPending}
              placeholder="Ask about the platform..."
              height="100%"
              emptyStateMessage="Ask anything about DPIS — products, recommendations, pipeline, or analytics."
              suggestedPrompts={PROMPT_PROBES}
            />
          </div>
        </div>
      )}
    </>
  );
}
