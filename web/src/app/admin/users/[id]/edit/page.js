'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { isAuthenticated, getStoredUser } from '@/lib/auth';
import authFetch from '@/lib/authFetch';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState({ phone: '', email: '', isActive: true, isVerified: false });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    const user = getStoredUser();
    if (user?.role !== 'admin') { router.push('/dashboard'); return; }
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await authFetch(`/api/v1/admin/users/${params.id}`);
      if (!res.ok) throw new Error('User not found');
      const d = await res.json();
      const u = d.data;
      setUser(u);
      setForm({
        phone: u.phone || '',
        email: u.email || '',
        isActive: u.isActive !== false,
        isVerified: u.isVerified || false,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await authFetch(`/api/v1/admin/users/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed to update user');
      router.push('/admin/users');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="text-primary-600 hover:underline text-sm">&larr; Back to Users</Link>
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-2">Edit User</h1>
        {user && (
          <p className="text-sm text-gray-500 mb-6">
            {user.profile?.name || user.phone} &middot; <span className="capitalize">{user.role}</span>
          </p>
        )}

        {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded border-gray-300" />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="isVerified" checked={form.isVerified} onChange={e => setForm(f => ({ ...f, isVerified: e.target.checked }))} className="rounded border-gray-300" />
              <label htmlFor="isVerified" className="text-sm font-medium text-gray-700">Verified</label>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            <Link href="/admin/users" className="btn-secondary inline-flex items-center px-4 py-2 text-sm rounded-lg border">Cancel</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
