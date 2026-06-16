'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { isAuthenticated } from '@/lib/auth';

export default function AdminChambersPage() {
  const [chambers, setChambers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    fetchChambers();
  }, []);

  const fetchChambers = async () => {
    try {
      const res = await fetch('/api/v1/admin/chambers?limit=100');
      const data = await res.json();
      setChambers(data.data?.chambers || data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, action) => {
    try {
      await fetch(`/api/v1/admin/chambers/${id}/${action}`, { method: 'POST' });
      fetchChambers();
    } catch {}
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Chamber Management</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-3">Name</th>
              <th className="pb-3">Doctor</th>
              <th className="pb-3">Location</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {chambers.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="py-3 font-medium">{c.name}</td>
                <td className="py-3">{c.doctor?.name}</td>
                <td className="py-3 text-sm">{c.address}, {c.city}</td>
                <td className="py-3">
                  <Badge status={c.isActive ? 'active' : 'inactive'} />
                </td>
                <td className="py-3">
                  <button
                    onClick={() => toggleStatus(c.id, c.isActive ? 'deactivate' : 'activate')}
                    className="text-primary-600 hover:underline text-sm"
                  >
                    {c.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
