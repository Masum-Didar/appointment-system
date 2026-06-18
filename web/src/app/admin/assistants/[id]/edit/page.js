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

export default function EditAssistantPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState({ name: '', phone: '', chamberId: '' });
  const [chambers, setChambers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [assistantId, setAssistantId] = useState(null);
  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    const user = getStoredUser();
    if (user?.role !== 'admin') { router.push('/dashboard'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, chambersRes] = await Promise.all([
        authFetch(`/api/v1/admin/users/${params.id}`),
        authFetch('/api/v1/admin/chambers?limit=200'),
      ]);
      if (!userRes.ok) throw new Error('Assistant not found');
      const userData = await userRes.json();
      const u = userData.data;
      setForm({
        name: u.profile?.name || '',
        phone: u.phone || '',
        chamberId: u.profile?.chamberId || u.chamber?.id || '',
      });
      setAssistantId(u.profile?.id || null);
      if (chambersRes.ok) {
        const cd = await chambersRes.json();
        setChambers(cd.data || []);
      }
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
      if (!assistantId) throw new Error('Assistant profile not found');
      const res = await authFetch(`/api/v1/admin/assistants/${assistantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          chamberId: form.chamberId || null,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed to update assistant');
      router.push(`/admin/assistants/${params.id}`);
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
        <Link href={`/admin/assistants/${params.id}`} className="text-primary-600 hover:underline text-sm">&larr; Back to Assistant</Link>
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Assistant</h1>

        {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Chamber</label>
              <select
                value={form.chamberId}
                onChange={e => setForm(f => ({ ...f, chamberId: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- No Chamber --</option>
                {chambers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.doctor ? ` (Dr. ${c.doctor.name})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            <Link href={`/admin/assistants/${params.id}`} className="btn-secondary inline-flex items-center px-4 py-2 text-sm rounded-lg border">Cancel</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
