"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Mail, Loader2, ToggleLeft, ToggleRight, Users,
  X, Phone, Building2, MapPin, ShieldCheck, Calendar, ExternalLink,
} from 'lucide-react';
import { searchUsers, updateUserStatus } from '@/services/adminApi';
import { getAllPharmacies, getPharmacistsByPharmacy } from '@/services/pharmacyApi';
import type { AdminUserResponse, PharmacyResponse } from '@/types/api';

const activeStyle  = 'bg-emerald-50 text-emerald-700 border-emerald-100';
const inactiveStyle = 'bg-slate-100 text-slate-500 border-slate-200';

const ROLE_STYLE: Record<string, string> = {
  SUPER_ADMIN: 'bg-violet-50 text-violet-700',
  MANAGER: 'bg-amber-50 text-amber-700',
  BRANCH_MANAGER: 'bg-sky-50 text-sky-700',
  PHARMACIST: 'bg-teal-50 text-teal-700',
  PATIENT: 'bg-slate-100 text-slate-600',
};

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  MANAGER: 'Pharmacy Admin',
  BRANCH_MANAGER: 'Branch Manager',
  PHARMACIST: 'Pharmacist',
  PATIENT: 'Patient',
};

const ROLE_FILTERS = [
  { label: 'All',            value: 'ALL' },
  { label: 'Super Admin',    value: 'SUPER_ADMIN' },
  { label: 'Pharmacy Admin', value: 'MANAGER' },
  { label: 'Branch Manager', value: 'BRANCH_MANAGER' },
  { label: 'Pharmacist',     value: 'PHARMACIST' },
  { label: 'Patient',        value: 'PATIENT' },
];

// ─── Profile Modal ─────────────────────────────────────────────────────────────

function ProfileModal({
  user,
  pharmacies,
  onClose,
}: {
  user: AdminUserResponse;
  pharmacies: PharmacyResponse[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [pharmacy, setPharmacy] = useState<PharmacyResponse | null | 'loading'>('loading');

  useEffect(() => {
    if (user.role === 'MANAGER') {
      const match = pharmacies.find(
        (p) => p.managerEmail?.toLowerCase() === user.email?.toLowerCase()
      );
      setPharmacy(match ?? null);
      return;
    }

    if (user.role === 'PHARMACIST') {
      // Search across all pharmacies for this pharmacist's email
      let cancelled = false;
      (async () => {
        for (const p of pharmacies) {
          try {
            const list = await getPharmacistsByPharmacy(p.id);
            if (list.some((ph) => ph.email?.toLowerCase() === user.email?.toLowerCase())) {
              if (!cancelled) setPharmacy(p);
              return;
            }
          } catch {
            // skip this pharmacy
          }
        }
        if (!cancelled) setPharmacy(null);
      })();
      return () => { cancelled = true; };
    }

    setPharmacy(null);
  }, [user, pharmacies]);

  const initials = user.fullName?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">User Profile</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition p-1">
            <X size={18} />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-5 flex items-start gap-4 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-lg border border-teal-100 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-slate-900 text-lg leading-tight">{user.fullName}</p>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${ROLE_STYLE[user.role] ?? 'bg-slate-100 text-slate-600'}`}>
                {ROLE_LABEL[user.role] ?? user.role.replace('_', ' ')}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${user.isActive ? activeStyle : inactiveStyle}`}>
                {user.isActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {user.email && (
                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                  <Mail size={13} className="shrink-0" /> {user.email}
                </p>
              )}
              {user.phoneNumber && (
                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                  <Phone size={13} className="shrink-0" /> {user.phoneNumber}
                </p>
              )}
              {user.createdAt && (
                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                  <Calendar size={13} className="shrink-0" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pharmacy Section — only for MANAGER and PHARMACIST */}
        {(user.role === 'MANAGER' || user.role === 'PHARMACIST') && (
          <div className="px-6 py-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Building2 size={13} /> Pharmacy
            </p>

            {pharmacy === 'loading' ? (
              <div className="flex items-center gap-2 text-slate-400 py-4">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Looking up pharmacy…</span>
              </div>
            ) : pharmacy === null ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center">
                <Building2 size={24} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-400 font-medium">No pharmacy linked</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {user.role === 'PHARMACIST'
                    ? 'This pharmacist may not be assigned to a pharmacy yet.'
                    : 'No pharmacy found with this manager.'}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shrink-0">
                    <Building2 size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-800 text-sm">{pharmacy.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                        pharmacy.status === 'ACTIVE' ? activeStyle :
                        pharmacy.status === 'INACTIVE' ? inactiveStyle :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {pharmacy.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{pharmacy.licenseNumber}</p>
                    {pharmacy.address && (
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin size={11} /> {pharmacy.address}
                      </p>
                    )}
                    {pharmacy.contactInfo && (
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Mail size={11} /> {pharmacy.contactInfo}
                      </p>
                    )}
                  </div>
                </div>
                <div className="px-4 pb-3 flex items-center justify-between">
                  {user.role === 'MANAGER' && (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <ShieldCheck size={11} className="text-teal-500" /> Manager of this pharmacy
                    </p>
                  )}
                  {user.role === 'PHARMACIST' && (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <ShieldCheck size={11} className="text-sky-500" /> Pharmacist at this pharmacy
                    </p>
                  )}
                  <button
                    onClick={() => router.push(`/super-admin/pharmacies/${pharmacy.id}`)}
                    className="flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-800 transition"
                  >
                    View pharmacy <ExternalLink size={11} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminsPage() {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [toggling, setToggling] = useState<number | null>(null);
  const [pharmacies, setPharmacies] = useState<PharmacyResponse[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await searchUsers({
        query: searchTerm || undefined,
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        page,
        size: 15,
      });
      setUsers(res.content);
      setTotal(res.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, page]);

  useEffect(() => { load(); }, [load]);

  // Fetch pharmacies once for manager/pharmacist lookups
  useEffect(() => {
    getAllPharmacies().then(setPharmacies).catch(() => {});
  }, []);

  const handleToggleStatus = async (user: AdminUserResponse) => {
    setToggling(user.id);
    try {
      const newActive = !user.isActive;
      await updateUserStatus(user.id, { isActive: newActive });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: newActive } : u));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setToggling(null);
    }
  };

  const canViewProfile = (role: string) => role === 'MANAGER' || role === 'PHARMACIST';

  return (
    <>
      <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 mt-1">Search, view, and manage all platform users by role.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            />
          </div>
          <div className="flex flex-wrap gap-1 bg-white border border-slate-200 rounded-lg p-1">
            {ROLE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setRoleFilter(f.value); setPage(0); }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${roleFilter === f.value ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 text-sm font-semibold">{error}</div>
        )}

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
              <Loader2 className="animate-spin" size={24} />
              <span>Loading users...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Activate / Deactivate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length > 0 ? users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition text-sm">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-sm border border-teal-100">
                          {user.fullName?.charAt(0) ?? '?'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{user.fullName}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail size={11} /> {user.email}
                          </p>
                          {canViewProfile(user.role) && (
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="mt-0.5 text-[11px] font-bold text-teal-600 hover:text-teal-800 hover:underline transition flex items-center gap-1"
                            >
                              <Building2 size={11} /> View pharmacy
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ROLE_STYLE[user.role] ?? 'bg-slate-100 text-slate-600'}`}>
                        {ROLE_LABEL[user.role] ?? user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{user.phoneNumber ?? '—'}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${user.isActive ? activeStyle : inactiveStyle}`}>
                        {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={toggling === user.id}
                        title={user.isActive ? 'Deactivate user' : 'Activate user'}
                        className="text-slate-400 hover:text-teal-600 transition disabled:opacity-50"
                      >
                        {toggling === user.id
                          ? <Loader2 size={18} className="animate-spin" />
                          : user.isActive
                            ? <ToggleRight size={22} className="text-teal-600" />
                            : <ToggleLeft size={22} />}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                      <Users size={32} className="mx-auto mb-2 opacity-40" />
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 bg-slate-50/30">
          <span>Showing {users.length} of {total} users</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 border border-slate-200 rounded disabled:opacity-50 bg-white hover:bg-slate-50">Previous</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={users.length < 15} className="px-3 py-1 border border-slate-200 rounded disabled:opacity-50 bg-white hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>

      {selectedUser && (
        <ProfileModal
          user={selectedUser}
          pharmacies={pharmacies}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
}
