"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ClipboardList, Package2, Users, Building2, UserRound } from "lucide-react";
import { getMyPharmacy, getMyPharmacyOrders, getInventory, getPharmacistsByPharmacy } from "@/services/pharmacyApi";
import { getAssignedOrders } from "@/services/pharmacistApi";
import { searchUsers, getAllPharmaciesAdmin } from "@/services/adminApi";
import type { OrderResponse, PharmacyInventoryResponse, PharmacistResponse, DispensingOrderResponse, PharmacyResponse, AdminUserResponse } from "@/types/api";

export type SearchRole = "PHARMACY_ADMIN" | "PHARMACIST" | "SUPER_ADMIN" | "PATIENT";

interface Result {
  id: string;
  label: string;
  sub: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export default function GlobalSearch({ role }: { role: SearchRole }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchRef = useRef<((q: string) => void) | null>(null);
  const router = useRouter();

  // keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);

  useEffect(() => {
    debouncedSearchRef.current = debounce(async (q: string) => {
      if (!q.trim()) { setResults([]); setLoading(false); return; }
      setLoading(true);
      try {
        const items: Result[] = [];
        const lc = q.toLowerCase();

        if (role === "PHARMACY_ADMIN") {
          const ph = await getMyPharmacy().catch(() => null);
          if (ph) {
            const [orders, inv, staff] = await Promise.all([
              getMyPharmacyOrders(ph.id).catch((): OrderResponse[] => []),
              getInventory(ph.id).catch((): PharmacyInventoryResponse[] => []),
              getPharmacistsByPharmacy(ph.id).catch((): PharmacistResponse[] => []),
            ]);
            orders.filter(o =>
              o.patientName?.toLowerCase().includes(lc) ||
              String(o.id).includes(lc) ||
              o.status?.toLowerCase().includes(lc)
            ).slice(0, 5).forEach(o => items.push({
              id: `order-${o.id}`,
              label: `Order #${o.id} — ${o.patientName}`,
              sub: o.status.replace(/_/g, " "),
              icon: ClipboardList,
              href: "/Pharmacy-admin/orders",
              color: "text-sky-600",
            }));
            inv.filter(i => i.medicineName?.toLowerCase().includes(lc))
              .slice(0, 4).forEach(i => items.push({
                id: `inv-${i.id}`,
                label: i.medicineName,
                sub: `${i.quantity} ${i.unit} · RWF ${i.price.toLocaleString()}`,
                icon: Package2,
                href: "/Pharmacy-admin/inventory",
                color: "text-amber-600",
              }));
            staff.filter(s => s.fullName?.toLowerCase().includes(lc) || s.pharmacistUniqueId?.toLowerCase().includes(lc))
              .slice(0, 3).forEach(s => items.push({
                id: `staff-${s.id}`,
                label: s.fullName ?? "Pharmacist",
                sub: `UID: ${s.pharmacistUniqueId ?? "—"}`,
                icon: Users,
                href: "/Pharmacy-admin/employees",
                color: "text-violet-600",
              }));
          }
        }

        if (role === "PHARMACIST") {
          const orders = await getAssignedOrders().catch((): DispensingOrderResponse[] => []);
          orders.filter(o =>
            o.patientName?.toLowerCase().includes(lc) ||
            String(o.id).includes(lc) ||
            o.status?.toLowerCase().includes(lc)
          ).slice(0, 8).forEach(o => items.push({
            id: `order-${o.id}`,
            label: `Order #${o.id} — ${o.patientName}`,
            sub: o.status.replace(/_/g, " "),
            icon: ClipboardList,
            href: "/pharmacist/orders",
            color: "text-sky-600",
          }));
        }

        if (role === "SUPER_ADMIN") {
          const [users, pharmacies] = await Promise.all([
            searchUsers({ query: q, page: 0, size: 5 }).catch(() => ({ content: [] as AdminUserResponse[] })),
            getAllPharmaciesAdmin().catch((): PharmacyResponse[] => []),
          ]);
          (users.content ?? []).forEach(u => items.push({
            id: `user-${u.id}`,
            label: u.fullName ?? u.email,
            sub: `${u.role} · ${u.email}`,
            icon: UserRound,
            href: `/super-admin/admins/${u.id}`,
            color: "text-indigo-600",
          }));
          pharmacies.filter(p =>
            p.name?.toLowerCase().includes(lc) ||
            p.address?.toLowerCase().includes(lc)
          ).slice(0, 4).forEach(p => items.push({
            id: `pharm-${p.id}`,
            label: p.name,
            sub: `${p.status} · ${p.address ?? ""}`,
            icon: Building2,
            href: `/super-admin/pharmacies/${p.id}`,
            color: "text-teal-600",
          }));
        }

        setResults(items);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    if (v.trim()) { setLoading(true); debouncedSearchRef.current?.(v); }
    else { setResults([]); setLoading(false); }
  };

  const pick = (href: string) => { setOpen(false); setQuery(""); setResults([]); router.push(href); };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 text-sm hover:border-slate-300 hover:text-slate-600 transition-colors shadow-sm"
      >
        <Search size={14} />
        <span className="hidden sm:inline">Search…</span>
        <kbd className="hidden sm:inline text-[10px] bg-slate-100 border border-slate-200 rounded px-1 py-0.5">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search size={18} className="text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            placeholder="Search orders, medicines, staff, users…"
            className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
          />
          {loading && <Loader2 size={16} className="text-slate-400 animate-spin flex-shrink-0" />}
          <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* results */}
        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 && query.trim() && !loading && (
            <p className="text-sm text-slate-400 text-center py-8">No results for &ldquo;{query}&rdquo;</p>
          )}
          {results.length === 0 && !query.trim() && (
            <p className="text-sm text-slate-400 text-center py-8">Start typing to search…</p>
          )}
          {results.map(r => (
            <button
              key={r.id}
              onClick={() => pick(r.href)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
            >
              <r.icon size={18} className={`flex-shrink-0 ${r.color}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{r.label}</p>
                <p className="text-xs text-slate-500 truncate">{r.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
