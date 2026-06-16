'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { isAuthenticated, getStoredUser } from '@/lib/auth';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function AdminPaymentsPage() {
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
      const res = await fetch(`/api/v1/admin/payments?${params}`, {
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
        <h1 className="text-2xl font-bold">Payment Management</h1>
        <select
          className="input-field w-auto"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {meta?.summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <p className="text-2xl font-bold text-primary-600">{formatCurrency(meta.summary.totalRevenue)}</p>
            <p className="text-xs text-gray-500">Total Revenue</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <p className="text-2xl font-bold text-success-600">{meta.summary.successful}</p>
            <p className="text-xs text-gray-500">Successful</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <p className="text-2xl font-bold text-danger-600">{meta.summary.failed}</p>
            <p className="text-xs text-gray-500">Failed</p>
          </div>
        </div>
      )}

      {loading ? <Spinner className="py-20" /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Token</th>
                <th className="pb-3">Patient</th>
                <th className="pb-3">Doctor</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Method</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-500">No payments found.</td></tr>
              ) : data.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 font-mono">{p.tokenNumber || '---'}</td>
                  <td className="py-3">{p.patient?.name || 'N/A'}</td>
                  <td className="py-3">{p.doctor?.name || 'N/A'}</td>
                  <td className="py-3 font-medium">{p.amount ? formatCurrency(p.amount) : '---'}</td>
                  <td className="py-3 capitalize">{p.paymentMethod || '---'}</td>
                  <td className="py-3">{p.createdAt ? formatDate(p.createdAt) : '---'}</td>
                  <td className="py-3"><Badge status={p.status} /></td>
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
