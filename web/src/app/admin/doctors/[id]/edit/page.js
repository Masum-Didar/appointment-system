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

export default function EditDoctorPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState({
    name: '', speciality: '', bmdcRegistrationNumber: '', consultationFee: '', followUpFee: '',
    biography: '', experienceYears: '', discountPercentage: '', availableForOnline: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    const user = getStoredUser();
    if (user?.role !== 'admin') { router.push('/dashboard'); return; }
    fetchDoctor();
  }, []);

  const fetchDoctor = async () => {
    try {
      const res = await authFetch(`/api/v1/admin/doctors/${params.id}`);
      if (!res.ok) throw new Error('Doctor not found');
      const d = await res.json();
      const doc = d.data;
      setForm({
        name: doc.name || '',
        speciality: doc.speciality || '',
        bmdcRegistrationNumber: doc.bmdcRegistrationNumber || '',
        consultationFee: doc.consultationFee?.toString() || '',
        followUpFee: doc.followUpFee?.toString() || '',
        biography: doc.biography || '',
        experienceYears: doc.experienceYears?.toString() || '',
        discountPercentage: doc.discountPercentage?.toString() || '',
        availableForOnline: doc.availableForOnline || false,
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
      const res = await authFetch(`/api/v1/admin/doctors/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          consultationFee: form.consultationFee ? parseFloat(form.consultationFee) : undefined,
          followUpFee: form.followUpFee ? parseFloat(form.followUpFee) : undefined,
          experienceYears: form.experienceYears ? parseInt(form.experienceYears) : undefined,
          discountPercentage: form.discountPercentage ? parseFloat(form.discountPercentage) : undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed to update doctor');
      router.push(`/admin/doctors/${params.id}`);
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
        <Link href={`/admin/doctors/${params.id}`} className="text-primary-600 hover:underline text-sm">&larr; Back to Doctor</Link>
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Doctor</h1>

        {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={e => update('name', e.target.value)} required />
            <Input label="Speciality" value={form.speciality} onChange={e => update('speciality', e.target.value)} />
            <Input label="BMDC Reg No." value={form.bmdcRegistrationNumber} onChange={e => update('bmdcRegistrationNumber', e.target.value)} />
            <Input label="Consultation Fee" type="number" value={form.consultationFee} onChange={e => update('consultationFee', e.target.value)} />
            <Input label="Follow-up Fee" type="number" value={form.followUpFee} onChange={e => update('followUpFee', e.target.value)} />
            <Input label="Discount %" type="number" value={form.discountPercentage} onChange={e => update('discountPercentage', e.target.value)} />
            <Input label="Experience (years)" type="number" value={form.experienceYears} onChange={e => update('experienceYears', e.target.value)} />
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="availableForOnline" checked={form.availableForOnline} onChange={e => update('availableForOnline', e.target.checked)} className="rounded border-gray-300" />
              <label htmlFor="availableForOnline" className="text-sm font-medium text-gray-700">Available for Online</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
            <textarea className="input-field" rows={3} value={form.biography} onChange={e => update('biography', e.target.value)} />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            <Link href={`/admin/doctors/${params.id}`} className="btn-secondary inline-flex items-center px-4 py-2 text-sm rounded-lg border">Cancel</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
