"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck, Package, ShieldCheck, RefreshCw, X } from "lucide-react";
import { getNotifications, markRead, markAllRead } from "@/services/notificationApi";
import type { NotificationItem } from "@/types/api";

function typeIcon(type: string) {
  switch (type) {
    case "ORDER":       return <Package size={14} className="text-teal-600" />;
    case "INSURANCE":   return <ShieldCheck size={14} className="text-violet-600" />;
    case "SUBSTITUTION": return <RefreshCw size={14} className="text-amber-600" />;
    default:            return <Bell size={14} className="text-slate-500" />;
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen]           = useState(false);
  const [items, setItems]         = useState<NotificationItem[]>([]);
  const [loading, setLoading]     = useState(false);
  const [unread, setUnread]       = useState(0);
  const panelRef                  = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setItems(data);
      setUnread(data.filter((n) => !n.read).length);
    } catch {
      // fail silently — notifications are non-critical
    } finally {
      setLoading(false);
    }
  };

  // Poll every 30 seconds
  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open) load();
  };

  const handleMarkRead = async (id: number) => {
    await markRead(id).catch(() => {});
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnread((c) => Math.max(0, c - 1));
  };

  const handleMarkAll = async () => {
    await markAllRead().catch(() => {});
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-800">
              Notifications {unread > 0 && <span className="ml-1 text-xs font-semibold text-rose-500">({unread} new)</span>}
            </p>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-semibold"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} /> All read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {loading && items.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">Loading…</p>
            ) : items.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">No notifications yet</p>
              </div>
            ) : (
              items.slice(0, 20).map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 transition ${n.read ? "bg-white" : "bg-teal-50/40"}`}
                >
                  <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {typeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-tight ${n.read ? "text-slate-600" : "text-slate-800 font-semibold"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-snug">{n.message}</p>
                    <p className="text-[10px] text-slate-300 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="shrink-0 p-1 text-slate-300 hover:text-teal-600 transition"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
