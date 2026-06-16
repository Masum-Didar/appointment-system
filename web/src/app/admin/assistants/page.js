'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { isAuthenticated, getStoredUser } from '@/lib/auth';
import authFetch from '@/lib/authFetch';

export default function AdminAssistantsPage() {
  const router = useRouter();
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: 'Assistant@123' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    const user = getStoredUser();
    if (user?.role !== 'admin') { router.push('/dashboard'); return; }
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      const res = await authFetch('/api/v1/admin/assistants?limit=100');
      if (!res.ok) throw new Error(res.statusText);
      const d = await res.json();
      setAssistants(d.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await authFetch('/api/v1/admin/assistants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed to create assistant');
      setForm({ name: '', phone: '', email: '', password: 'Assistant@123' });
      setShowForm(false);
      fetchAssistants();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assistant Management</h1>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Assistant'}</Button>
      </div>

      {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

      {showForm && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">New Assistant</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <Input label="Phone *" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
              <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Assistant'}</Button>
          </form>
        </Card>
      )}

      <div className="overflow-x-auto">
        {assistants.length === 0 ? (
          <p className="text-center py-10 text-gray-500">No assistants found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Name</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">Chamber</th>
                <th className="pb-3">Doctor</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {assistants.map(a => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 font-medium">
                    <Link href={`/admin/assistants/${a.userId}`} className="text-primary-600 hover:underline">{a.name}</Link>
                  </td>
                  <td className="py-3">{a.phone || '---'}</td>
                  <td className="py-3">{a.chamber?.name || '---'}</td>
                  <td className="py-3">
                    {a.doctor ? (
                      <Link href={`/admin/doctors/${a.doctor.id}`} className="text-primary-600 hover:underline">{a.doctor.name}</Link>
                    ) : '---'}
                  </td>
                  <td className="py-3"><Badge status={a.isActive ? 'active' : 'inactive'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
