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

export default function EditChamberPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState({
    name: '', address: '', city: '', area: '', contactPhone: '',
    chamberType: 'chamber', serialPrefix: '', isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    const user = getStoredUser();
    if (user?.role !== 'admin') { router.push('/dashboard'); return; }
    fetchChamber();
  }, []);

  const fetchChamber = async () => {
    try {
      const res = await authFetch(`/api/v1/admin/chambers/${params.id}`);
      if (!res.ok) throw new Error('Chamber not found');
      const d = await res.json();
      const c = d.data;
      setForm({
        name: c.name || '',
        address: c.address || '',
        city: c.city || '',
        area: c.area || '',
        contactPhone: c.contactPhone || '',
        chamberType: c.chamberType || 'chamber',
        serialPrefix: c.serialPrefix || 'CH',
        isActive: c.isActive !== false,
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
      const res = await authFetch(`/api/v1/admin/chambers/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed to update chamber');
      router.push('/admin/chambers');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/chambers" className="text-primary-600 hover:underline text-sm">&larr; Back to Chambers</Link>
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Chamber</h1>

        {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Chamber Name" value={form.name} onChange={e => update('name', e.target.value)} required />
            <Input label="City" value={form.city} onChange={e => update('city', e.target.value)} required />
            <Input label="Area" value={form.area} onChange={e => update('area', e.target.value)} />
            <Input label="Contact Phone" value={form.contactPhone} onChange={e => update('contactPhone', e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chamber Type</label>
              <select value={form.chamberType} onChange={e => update('chamberType', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="chamber">Chamber</option>
                <option value="clinic">Clinic</option>
                <option value="hospital">Hospital</option>
                <option value="diagnostic_center">Diagnostic Center</option>
              </select>
            </div>
            <Input label="Serial Prefix" value={form.serialPrefix} onChange={e => update('serialPrefix', e.target.value)} />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea className="input-field" rows={2} value={form.address} onChange={e => update('address', e.target.value)} required />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => update('isActive', e.target.checked)} className="rounded border-gray-300" />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            <Link href="/admin/chambers" className="btn-secondary inline-flex items-center px-4 py-2 text-sm rounded-lg border">Cancel</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
