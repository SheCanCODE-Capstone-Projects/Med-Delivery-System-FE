"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import MedDeliveryLogo from "@/components/brand/MedDeliveryLogo";
import { logout, getUserName } from "@/services/authApi";
import { askChatbot } from "@/services/patientApi";
import NotificationBell from "@/components/notifications/NotificationBell";
import {
  ClipboardList,
  LayoutGrid,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Pill,
  Send,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";

const navItems = [
  { icon: LayoutGrid,    label: "Dashboard",        href: "/patient-dashboard" },
  { icon: Pill,          label: "Request Medicine",  href: "/order" },
  { icon: ClipboardList, label: "Track Orders",      href: "/tracking" },
  { icon: MapPin,        label: "Locations",         href: "/locations" },
  { icon: ShieldCheck,   label: "Insurance",         href: "/insurance" },
  { icon: Settings,      label: "Settings",          href: "/profile" },
];

function NavItem({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/patient-dashboard" && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
          : "text-slate-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Hi! I'm MedBot. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setSending(true);
    try {
      const res = await askChatbot({ message: text });
      setMessages((m) => [...m, { role: "assistant", text: res.reply ?? "Sorry, I couldn't respond." }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "The AI assistant is temporarily unavailable. Please try again later.";
      setMessages((m) => [...m, { role: "assistant", text: msg }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-teal-600 text-white shadow-2xl flex items-center justify-center hover:bg-teal-700 transition-all active:scale-95"
        aria-label="Open MedBot"
      >
        {open ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          style={{ maxHeight: "calc(100vh - 120px)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-teal-600 text-white">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
              <MessageSquare size={16} />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">MedBot</p>
              <p className="text-xs text-teal-100">Your pharmacy assistant</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/70 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50" style={{ minHeight: 220, maxHeight: 340 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-teal-600 text-white rounded-br-sm"
                    : "bg-white text-slate-700 border border-slate-200 rounded-bl-sm shadow-sm"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                  <span className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-slate-100 bg-white flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about medicines…"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            />
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              className="h-9 w-9 rounded-xl bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 disabled:opacity-40 transition shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function PatientAppShell({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setUserName(getUserName()); }, []);

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = async () => {
    await logout().catch(() => {});
    router.push("/auth/login");
  };

  const sidebarContent = (
    <>
      <div className="px-6 mb-8 flex items-center justify-between">
        <MedDeliveryLogo href="/patient-dashboard" theme="dark" size="sm" showTagline={false} />
        <button onClick={closeSidebar} className="lg:hidden text-slate-400 hover:text-white p-1">
          <X size={20} />
        </button>
      </div>

      <div className="px-6 mb-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-semibold border border-teal-500/20">
          <ShieldCheck size={12} />
          Patient
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} onClick={closeSidebar} />
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <div className="px-4 mb-3">
          <p className="text-sm font-semibold text-white leading-tight truncate">
            {userName ?? "Patient"}
          </p>
          <p className="text-xs text-teal-400 font-medium">patient</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#f7f9fc] text-slate-800 font-sans overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-[#0F172A] border-r border-white/5 flex flex-col pt-6 shadow-xl
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:flex
        `}
      >
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-800">Patient Portal</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Manage your medicines and deliveries</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <NotificationBell />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20 shrink-0">
                <span className="text-xs font-bold text-teal-600">
                  {userName ? userName.slice(0, 2).toUpperCase() : "PA"}
                </span>
              </div>
              <div className="flex-col hidden sm:flex">
                <span className="text-sm font-semibold text-slate-800 leading-tight">
                  {userName?.split(" ")[0] ?? "Patient"}
                </span>
                <span className="text-xs text-teal-600 font-medium">patient</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>

      {/* Floating chatbot */}
      <FloatingChatbot />
    </div>
  );
}
