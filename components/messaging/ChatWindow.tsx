"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send } from "lucide-react";
import { t, Lang } from "@/lib/i18n";

interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: { full_name: string };
}

interface ChatWindowProps {
  bookingId: string;
  currentUserId: string;
  lang: Lang;
}

export default function ChatWindow({ bookingId, currentUserId, lang }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*, sender:profiles!messages_sender_id_fkey(full_name)")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: true });

      if (data) setMessages(data as Message[]);
    }

    loadMessages();

    const channel = supabase
      .channel(`booking-chat-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `booking_id=eq.${bookingId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from("messages")
            .select("*, sender:profiles!messages_sender_id_fkey(full_name)")
            .eq("id", payload.new.id)
            .single();
          if (data) setMessages((prev) => [...prev, data as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setSending(true);
    await supabase.from("messages").insert({
      booking_id: bookingId,
      sender_id: currentUserId,
      content: input.trim(),
    });
    setInput("");
    setSending(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="min-h-[200px] max-h-[400px] overflow-y-auto space-y-3 pb-2">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">{t("noMessages", lang)}</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            const sender = msg.sender as { full_name: string } | null;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <span className="text-xs text-gray-400 mb-1 px-1">
                  {isMe ? t("me", lang) : sender?.full_name}
                </span>
                <div
                  className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-tl-sm"
                      : "bg-gray-100 text-gray-800 rounded-tr-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-xs text-gray-300 mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString(lang === "he" ? "he-IL" : "en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 border-t border-gray-100 pt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("writeMessage", lang)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
