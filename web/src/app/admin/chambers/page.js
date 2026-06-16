'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import { isAuthenticated, getStoredUser } from '@/lib/auth';

export default function AdminChambersPage() {
  const [chambers, setChambers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    const user = getStoredUser();
    if (user?.role !== 'admin') { router.push('/dashboard'); return; }
    fetchChambers();
  }, []);

  const fetchChambers = async () => {
    try {
      const res = await fetch('/api/v1/admin/chambers?limit=100', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      const data = await res.json();
      setChambers(data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, isActive) => {
    try {
      await fetch(`/api/v1/admin/chambers/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ isActive }),
      });
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
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/chambers/${c.id}/edit`} className="text-primary-600 hover:underline text-sm">Edit</Link>
                    <button
                      onClick={() => toggleStatus(c.id, !c.isActive)}
                      className="text-primary-600 hover:underline text-sm"
                    >
                      {c.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
