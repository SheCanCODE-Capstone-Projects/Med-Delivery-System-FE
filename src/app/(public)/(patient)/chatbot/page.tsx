"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MessageSquare, Send, Bot, User } from "lucide-react";
import PatientAppShell from "@/components/layout/PatientAppShell";
import { askChatbot } from "@/services/patientApi";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

function fmt() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hello! I'm MedBot, your medical assistant. I can help you with questions about medications, side effects, dosage guidance, and how to use MedDelivery. How can I help you today?",
      time: fmt(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError("");

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      time: fmt(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await askChatbot({ message: text }, conversationId);
      if (!conversationId && res.conversationId) {
        setConversationId(res.conversationId);
      }
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: "assistant",
        text: res.reply,
        time: fmt(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get a response. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setInput(text);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const suggestions = [
    "What are common side effects of ibuprofen?",
    "How do I store insulin properly?",
    "Can I take paracetamol with metformin?",
    "How does the prescription process work?",
  ];

  return (
    <PatientAppShell>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
            <Bot className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">MedBot</h1>
            <p className="text-xs text-slate-500">Medical assistant powered by AI</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user"
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-teal-600 text-white rounded-tr-sm"
                      : "bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 px-1">{msg.time}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <Bot size={14} className="text-slate-600" />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestions (shown when only welcome message) */}
        {messages.length === 1 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => { setInput(s); inputRef.current?.focus(); }}
                className="text-left text-xs text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2.5 hover:border-teal-300 hover:text-teal-700 transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        {/* Input */}
        <div className="mt-3 flex gap-3 items-end">
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/15 transition">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about medications, side effects, or how to use MedDelivery…"
              rows={1}
              disabled={loading}
              className="w-full px-4 py-3 text-sm text-slate-800 bg-transparent outline-none resize-none disabled:opacity-60"
              style={{ maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="h-11 w-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm shrink-0"
            aria-label="Send message"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-400">
          MedBot provides general information only — not a substitute for professional medical advice.
        </p>
      </div>
    </PatientAppShell>
  );
}
