'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import { isAuthenticated, getStoredUser } from '@/lib/auth';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    const user = getStoredUser();
    if (user?.role !== 'admin') { router.push('/dashboard'); return; }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/v1/admin/users?limit=100', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      const data = await res.json();
      setUsers(data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (userId, isActive) => {
    try {
      await fetch(`/api/v1/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ isActive }),
      });
      fetchUsers();
    } catch {}
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-3">Name</th>
              <th className="pb-3">Phone</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="py-3 font-medium">{u.profile?.name || u.phone}</td>
                <td className="py-3">{u.phone}</td>
                <td className="py-3">
                  <Badge status={u.role} />
                </td>
                <td className="py-3">
                  <Badge status={u.isActive ? 'active' : 'inactive'} />
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/users/${u.id}/edit`} className="text-primary-600 hover:underline text-sm">Edit</Link>
                    <button
                      onClick={() => toggleStatus(u.id, !u.isActive)}
                      className="text-primary-600 hover:underline text-sm"
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
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
