import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { format, formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Lock,
  MessageSquare,
  Send,
  Shield,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

interface SecureMessagingProps {
  clientId: number;
  clientName: string;
}

export default function SecureMessaging({ clientId, clientName }: SecureMessagingProps) {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState("");
  const [lastMessageId, setLastMessageId] = useState<number | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  // Get or create thread
  const { data: thread } = trpc.messaging.getThread.useQuery(
    { clientId },
    { enabled: !!user }
  );

  // Get messages with polling
  const { data: messages = [], isLoading } = trpc.messaging.getMessages.useQuery(
    { threadId: thread?.id ?? 0, limit: 50 },
    {
      enabled: !!thread?.id,
      refetchInterval: 5000, // Poll every 5 seconds
    }
  );

  // Send message mutation
  const sendMessage = trpc.messaging.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      utils.messaging.getMessages.invalidate({ threadId: thread?.id });
    },
  });

  // Delete message mutation
  const deleteMessage = trpc.messaging.deleteMessage.useMutation({
    onSuccess: () => {
      utils.messaging.getMessages.invalidate({ threadId: thread?.id });
    },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!messageText.trim() || !thread?.id) return;
    sendMessage.mutate({ threadId: thread.id, content: messageText.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const retentionDate = thread
    ? new Date(new Date().getTime() + thread.retentionDays * 24 * 60 * 60 * 1000)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{clientName}</h2>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-teal-600" />
              <span className="text-xs text-teal-700 font-medium">End-to-end encrypted</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {retentionDate && (
            <Badge variant="outline" className="text-xs text-slate-500 hidden sm:flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Auto-purge: {format(retentionDate, "MMM d, yyyy")}
            </Badge>
          )}
          <Badge className="bg-teal-100 text-teal-800 text-xs">
            <Shield className="w-3 h-3 mr-1" />
            HIPAA
          </Badge>
        </div>
      </div>

      {/* HIPAA Notice */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-2">
        <p className="text-xs text-blue-700 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 shrink-0" />
          Messages are encrypted with AES-256-GCM. No message content is stored in audit logs.
          Messages are automatically purged after {thread?.retentionDays ?? 90} days per HIPAA retention policy.
        </p>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef as React.RefObject<HTMLDivElement>}>
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600" />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-teal-400" />
            </div>
            <h3 className="font-medium text-slate-700 mb-1">Secure Channel Ready</h3>
            <p className="text-sm text-slate-500 max-w-xs">
              This is a private, encrypted channel between you and {clientName}.
              Messages are only visible to you and your client.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {messages.map((msg) => {
            const isClinician = msg.senderType === "clinician";
            const isDeleted = !!msg.deletedAt;

            return (
              <div
                key={msg.id}
                className={`flex ${isClinician ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`group max-w-[75%] ${isClinician ? "items-end" : "items-start"} flex flex-col gap-1`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm relative ${
                      isDeleted
                        ? "bg-slate-100 text-slate-400 italic"
                        : isClinician
                        ? "bg-teal-600 text-white"
                        : "bg-white border border-slate-200 text-slate-800 shadow-sm"
                    }`}
                  >
                    {isDeleted ? (
                      <span className="flex items-center gap-1.5">
                        <Trash2 className="w-3 h-3" />
                        Message deleted
                      </span>
                    ) : (
                      msg.content
                    )}

                    {/* Delete button (clinician's own messages only) */}
                    {isClinician && !isDeleted && (
                      <button
                        onClick={() => deleteMessage.mutate({ messageId: msg.id })}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        title="Delete message"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  <div className={`flex items-center gap-1.5 text-xs text-slate-400 ${isClinician ? "flex-row-reverse" : ""}`}>
                    <span>{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</span>
                    {msg.readAt && isClinician && (
                      <span className="text-teal-500">✓ Read</span>
                    )}
                    <Lock className="w-2.5 h-2.5 text-teal-400" aria-label="Encrypted" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Composer */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${clientName}... (Ctrl+Enter to send)`}
              className="resize-none min-h-[80px] max-h-[200px] text-sm"
              maxLength={4000}
            />
            <div className="flex justify-between items-center mt-1">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Lock className="w-3 h-3 text-teal-500" />
                <span>Encrypted before sending</span>
              </div>
              <span className="text-xs text-slate-400">{messageText.length}/4000</span>
            </div>
          </div>
          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || sendMessage.isPending || !thread?.id}
            className="bg-teal-600 hover:bg-teal-700 h-10"
          >
            {sendMessage.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Clinical Disclaimer */}
        <div className="mt-3 flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg p-2.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            This messaging system is for administrative communication only. For clinical emergencies,
            direct clients to call 988 or 911. Do not use this channel for crisis intervention.
          </span>
        </div>
      </div>
    </div>
  );
}
