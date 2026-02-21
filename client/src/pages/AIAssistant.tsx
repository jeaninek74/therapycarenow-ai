import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Bot, Send, AlertTriangle, Shield, Loader2, Phone } from "lucide-react";
import NavBar from "@/components/NavBar";
import StatePicker from "@/components/StatePicker";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  blocked?: boolean;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: `Hello! I'm the TherapyCareNow AI assistant. I can help you:

- **Understand your options** for mental health support
- **Explain different therapy types** (CBT, DBT, EMDR, etc.)
- **Navigate insurance and EAP benefits**
- **Refine your therapist search**

**Important:** I am not a therapist and cannot provide clinical advice, diagnosis, or treatment. If you're in crisis, please call or text **988** immediately.

What can I help you with today?`,
};

export default function AIAssistant() {
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [stateCode, setStateCode] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = trpc.ai.chat.useMutation({
    onSuccess: (result) => {
      if (result.crisisMode) {
        // Crisis mode triggered — redirect to crisis page
        navigate("/crisis");
        return;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: result.content ?? "I'm unable to respond right now. Please try again.",
        blocked: result.blocked,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (err) => {
      toast.error("Something went wrong. Please try again.");
      setMessages((prev) => prev.slice(0, -1)); // Remove pending user message
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sendMessage.isPending) return;

    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    sendMessage.mutate({ message: trimmed, stateCode });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />

      <div className="container flex-1 flex flex-col py-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">AI Assistant</h1>
              <p className="text-xs text-muted-foreground">Navigation help only — not clinical advice</p>
            </div>
          </div>
          <div className="w-40">
            <StatePicker value={stateCode} onChange={setStateCode} placeholder="Your state" />
          </div>
        </div>

        {/* Guardrail notice */}
        <div className="bg-muted/50 border border-border rounded-xl p-3 flex items-start gap-2 mb-4 text-xs text-muted-foreground">
          <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            All messages are screened for safety. If a crisis is detected, you will be immediately routed to emergency resources.
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 mb-4 min-h-[300px] max-h-[500px]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : msg.blocked
                    ? "bg-muted border border-border text-muted-foreground"
                    : "bg-card border border-border text-foreground"
                }`}
              >
                {msg.blocked && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <AlertTriangle className="w-3 h-3" />
                    Response modified for safety
                  </div>
                )}
                {msg.role === "assistant" ? (
                  <Streamdown className="prose prose-sm max-w-none text-inherit">{msg.content}</Streamdown>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {sendMessage.isPending && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about therapy types, insurance, finding a provider..."
            className="flex-1 resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[52px] max-h-[120px]"
            rows={1}
            disabled={sendMessage.isPending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
            className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-40 active:scale-95 transition-all self-end"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Crisis reminder */}
        <div className="mt-4 text-center">
          <a href="tel:988" className="inline-flex items-center gap-1 text-xs text-destructive hover:underline">
            <Phone className="w-3 h-3" />
            In crisis? Call or text 988 now
          </a>
        </div>
      </div>
    </div>
  );
}
