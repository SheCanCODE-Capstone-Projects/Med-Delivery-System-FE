"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import {
  getDashboardStats, getAllPharmaciesAdmin, getAuditLogs, searchUsers,
} from '@/services/adminApi';
import type { PharmacyResponse, AuditLogResponse, DashboardStatsResponse } from '@/types/api';
import PrintableReport from '@/components/report/PrintableReport';
import ReportTable from '@/components/report/ReportTable';

function fmtDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString();
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Active',
  PENDING_APPROVAL: 'Pending',
  SUSPENDED: 'Suspended',
  REJECTED: 'Rejected',
};

export default function SuperAdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [allPharmacies, setAllPharmacies] = useState<PharmacyResponse[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [reportDate] = useState(() => new Date().toLocaleString());

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [s, ph, logs, usersRes] = await Promise.all([
        getDashboardStats().catch(() => null),
        getAllPharmaciesAdmin().catch(() => [] as PharmacyResponse[]),
        getAuditLogs().catch(() => [] as AuditLogResponse[]),
        searchUsers({ page: 0, size: 1 }).catch(() => ({ totalElements: 0, content: [] })),
      ]);
      setStats(s);
      setAllPharmacies(Array.isArray(ph) ? ph : []);
      setAuditLogs(Array.isArray(logs) ? logs : []);
      setTotalUsers(usersRes?.totalElements ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
      <Loader2 className="animate-spin" size={24} /><span>Loading report...</span>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm">
      {error}{' '}
      <button onClick={load} className="underline ml-2">Retry</button>
    </div>
  );

  const active    = allPharmacies.filter((p) => p.status === 'ACTIVE').length;
  const pending   = allPharmacies.filter((p) => p.status === 'PENDING_APPROVAL').length;
  const suspended = allPharmacies.filter((p) => p.status === 'SUSPENDED').length;

  return (
    <PrintableReport
      title="Platform System Report"
      filename={`platform-report-${new Date().toISOString().slice(0, 10)}.pdf`}
      generatedBy="Super Admin"
      generatedDate={reportDate}
      meta={{ rows: [
        { label: 'Report Type',          value: 'Comprehensive Platform Overview' },
        { label: 'Total Pharmacies',     value: allPharmacies.length },
        { label: 'Active Pharmacies',    value: active },
        { label: 'Pending Approvals',    value: pending },
        { label: 'Suspended',            value: suspended },
        { label: 'Total Users',          value: totalUsers },
        { label: 'Patients',             value: stats?.totalPatients ?? 0 },
        { label: 'Active Pharmacists',   value: stats?.activePharmacists ?? 0 },
        { label: 'Generated On',         value: reportDate },
      ]}}
    >
      <ReportTable
        title="Pharmacy Registry"
        columns={['Pharmacy Name', 'Code', 'License', 'Contact', 'Status']}
        rows={allPharmacies.map((ph) => [
          ph.name,
          ph.pharmacyCode ?? '—',
          ph.licenseNumber ?? '—',
          ph.managerEmail ?? ph.contactInfo ?? '—',
          STATUS_LABEL[ph.status ?? ''] ?? ph.status ?? '—',
        ])}
        emptyMessage="No pharmacies found."
      />

      <ReportTable
        title="Recent Administrative Activity"
        columns={['Action', 'Details', 'Performed By', 'Date & Time']}
        rows={auditLogs.slice(0, 30).map((log) => [
          log.action,
          log.details ?? `${log.action} on ${log.targetType ?? 'resource'}${log.targetId ? ` #${log.targetId}` : ''}`,
          log.performedBy,
          fmtDate(log.createdAt),
        ])}
        emptyMessage="No audit logs."
      />
    </PrintableReport>
  );
}
