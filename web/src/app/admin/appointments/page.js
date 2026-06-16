'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { isAuthenticated, getStoredUser } from '@/lib/auth';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    const user = getStoredUser();
    if (user?.role !== 'admin') { router.push('/dashboard'); return; }
    fetchData();
  }, [page, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/v1/admin/appointments?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      const d = await res.json();
      setData(d.data || []);
      setMeta(d.meta || null);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Appointment Management</h1>
        <select
          className="input-field w-auto"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked_in">Checked In</option>
          <option value="in_consultation">In Consultation</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="missed">Missed</option>
        </select>
      </div>

      {loading ? <Spinner className="py-20" /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Token</th>
                <th className="pb-3">Patient</th>
                <th className="pb-3">Doctor</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Fee</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-500">No appointments found.</td></tr>
              ) : data.map((a) => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 font-mono">{a.tokenNumber || `${a.serialNumber || '---'}`}</td>
                  <td className="py-3">{a.patient?.name || 'N/A'}</td>
                  <td className="py-3">{a.doctor?.name || 'N/A'}</td>
                  <td className="py-3">{a.appointmentDate ? formatDate(a.appointmentDate) : 'N/A'}</td>
                  <td className="py-3">{a.consultationFee ? formatCurrency(a.consultationFee) : '---'}</td>
                  <td className="py-3"><Badge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-secondary text-sm">Prev</button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {meta.page} of {meta.totalPages}</span>
          <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="btn-secondary text-sm">Next</button>
        </div>
      )}
    </div>
  );
}
