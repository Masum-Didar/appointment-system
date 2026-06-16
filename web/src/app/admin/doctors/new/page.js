'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { isAuthenticated, getStoredUser } from '@/lib/auth';
import authFetch from '@/lib/authFetch';

export default function AddDoctorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: 'Doctor@123',
    speciality: '', bmdcRegistrationNumber: '', consultationFee: '', followUpFee: '',
    biography: '', experienceYears: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    const user = getStoredUser();
    if (user?.role !== 'admin') { router.push('/dashboard'); return; }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authFetch('/api/v1/admin/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          consultationFee: form.consultationFee ? parseFloat(form.consultationFee) : undefined,
          followUpFee: form.followUpFee ? parseFloat(form.followUpFee) : undefined,
          experienceYears: form.experienceYears ? parseInt(form.experienceYears) : undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed to create doctor');
      router.push('/admin/doctors');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/doctors" className="text-primary-600 hover:underline text-sm">&larr; Back to Doctors</Link>
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Add New Doctor</h1>

        {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Full Name *" value={form.name} onChange={e => update('name', e.target.value)} required />
            <Input label="Phone *" value={form.phone} onChange={e => update('phone', e.target.value)} required />
            <Input label="Email" type="email" value={form.email} onChange={e => update('email', e.target.value)} />
            <Input label="Password" type="password" value={form.password} onChange={e => update('password', e.target.value)} />
            <Input label="Speciality" value={form.speciality} onChange={e => update('speciality', e.target.value)} />
            <Input label="BMDC Reg No." value={form.bmdcRegistrationNumber} onChange={e => update('bmdcRegistrationNumber', e.target.value)} />
            <Input label="Consultation Fee" type="number" value={form.consultationFee} onChange={e => update('consultationFee', e.target.value)} />
            <Input label="Follow-up Fee" type="number" value={form.followUpFee} onChange={e => update('followUpFee', e.target.value)} />
            <Input label="Experience (years)" type="number" value={form.experienceYears} onChange={e => update('experienceYears', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
            <textarea className="input-field" rows={3} value={form.biography} onChange={e => update('biography', e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Doctor'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
