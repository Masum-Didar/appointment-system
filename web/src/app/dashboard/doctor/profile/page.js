'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { isAuthenticated, getStoredUser } from '@/lib/auth';
import authFetch from '@/lib/authFetch';

export default function DoctorProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    speciality: '',
    biography: '',
    consultationFee: '',
    followUpFee: '',
    experienceYears: '',
    availableForOnline: false,
  });

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    const user = getStoredUser();
    if (user?.role !== 'doctor') { router.push('/dashboard'); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authFetch('/api/v1/doctors/me');
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      setProfile(data.data);
      setForm({
        name: data.data.name || '',
        speciality: data.data.speciality || '',
        biography: data.data.biography || '',
        consultationFee: data.data.consultationFee?.toString() || '',
        followUpFee: data.data.followUpFee?.toString() || '',
        experienceYears: data.data.experienceYears?.toString() || '',
        availableForOnline: data.data.availableForOnline || false,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await authFetch(`/api/v1/doctors/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          speciality: form.speciality,
          biography: form.biography,
          consultationFee: form.consultationFee ? Number(form.consultationFee) : undefined,
          followUpFee: form.followUpFee ? Number(form.followUpFee) : undefined,
          experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
          availableForOnline: form.availableForOnline,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Failed to update profile');
      }
      const data = await res.json();
      setProfile(data.data);
      setSuccess('Profile updated successfully');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;
  if (!profile) return <p className="text-center py-20 text-red-500">{error || 'Profile not found.'}</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
      {success && <p className="text-green-600 bg-green-50 p-3 rounded-lg">{success}</p>}

      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600 shrink-0">
            {profile.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-primary-600">{profile.speciality}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              label="Speciality"
              value={form.speciality}
              onChange={e => setForm(f => ({ ...f, speciality: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
            <textarea
              value={form.biography}
              onChange={e => setForm(f => ({ ...f, biography: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Input
              label="Consultation Fee (৳)"
              type="number"
              value={form.consultationFee}
              onChange={e => setForm(f => ({ ...f, consultationFee: e.target.value }))}
            />
            <Input
              label="Follow-up Fee (৳)"
              type="number"
              value={form.followUpFee}
              onChange={e => setForm(f => ({ ...f, followUpFee: e.target.value }))}
            />
            <Input
              label="Experience (years)"
              type="number"
              value={form.experienceYears}
              onChange={e => setForm(f => ({ ...f, experienceYears: e.target.value }))}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.availableForOnline}
              onChange={e => setForm(f => ({ ...f, availableForOnline: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <span>Available for online consultation</span>
          </label>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
