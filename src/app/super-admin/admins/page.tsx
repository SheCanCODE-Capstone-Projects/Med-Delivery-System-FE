"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Mail, Loader2, ToggleLeft, ToggleRight, Users } from 'lucide-react';
import { searchUsers, updateUserStatus } from '@/services/adminApi';
import type { AdminUserResponse } from '@/types/api';

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  INACTIVE: 'bg-slate-100 text-slate-500 border-slate-200',
  SUSPENDED: 'bg-rose-50 text-rose-600 border-rose-100',
};

export default function AdminsPage() {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [toggling, setToggling] = useState<number | null>(null);

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

  const handleToggleStatus = async (user: AdminUserResponse) => {
    setToggling(user.id);
    try {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await updateUserStatus(user.id, { status: newStatus });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setToggling(null);
    }
  };

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
          <div className="flex bg-white border border-slate-200 rounded-lg p-1">
            {['ALL', 'SUPER_ADMIN', 'MANAGER', 'PHARMACIST', 'PATIENT'].map((r) => (
              <button
                key={r}
                onClick={() => { setRoleFilter(r); setPage(0); }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${roleFilter === r ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {r === 'ALL' ? 'All' : r.replace('_', ' ')}
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
                  <th className="px-6 py-4 text-center">Toggle</th>
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
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{user.phoneNumber ?? '—'}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[user.status] ?? 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={toggling === user.id}
                        title={user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        className="text-slate-400 hover:text-teal-600 transition disabled:opacity-50"
                      >
                        {toggling === user.id
                          ? <Loader2 size={18} className="animate-spin" />
                          : user.status === 'ACTIVE'
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
    </>
  );
}
