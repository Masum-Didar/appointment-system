'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { isAuthenticated } from '@/lib/auth';
import authFetch from '@/lib/authFetch';
import { formatDate, formatCurrency } from '@/lib/utils';

function Avatar({ name, avatarUrl, size = 'lg' }) {
  const initials = name
    ?.split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-14 h-14 text-lg', lg: 'w-20 h-20 text-2xl' };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover border-4 border-white shadow`}
      />
    );
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-primary-600 flex items-center justify-center text-white font-bold border-4 border-white shadow`}>
      {initials}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="font-medium text-sm text-right">{value || '---'}</span>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authFetch('/api/v1/auth/profile');
      const data = await res.json();
      setProfile(data.data);
      setForm({
        name: data.data?.profile?.name || data.data?.name || '',
        email: data.data?.email || '',
        address: data.data?.profile?.address || '',
      });
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await authFetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setEditing(false);
      fetchProfile();
    } catch {
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;
  if (!profile) return <p className="text-center py-20 text-gray-500">Profile not found.</p>;

  const p = profile.profile || {};
  const role = profile.role;
  const name = p.name || profile.name || 'User';
  const avatarUrl = p.avatarUrl;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card className="p-6">
        <div className="flex flex-col items-center mb-6">
          <Avatar name={name} avatarUrl={avatarUrl} />
          <h2 className="text-xl font-bold mt-3">{name}</h2>
          <Badge status={role} />
        </div>

        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input label="Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Phone" value={profile.phone || ''} disabled />
            <Input label="Email" type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {role === 'patient' && (
              <Input label="Address" value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })} />
            )}
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={updating} className="flex-1">Save</Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
            </div>
          </form>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              <DetailRow label="Phone" value={profile.phone} />
              <DetailRow label="Email" value={profile.email} />
              <DetailRow label="Member Since" value={profile.createdAt ? formatDate(profile.createdAt) : '---'} />
              {profile.isVerified !== undefined && (
                <DetailRow label="Verified" value={profile.isVerified ? 'Yes' : 'No'} />
              )}

              {role === 'patient' && (
                <>
                  <DetailRow label="Address" value={p.address} />
                  <DetailRow label="City" value={p.city} />
                  <DetailRow label="Blood Group" value={p.bloodGroup} />
                  <DetailRow label="Gender" value={p.gender} />
                  <DetailRow label="Date of Birth" value={p.dateOfBirth ? formatDate(p.dateOfBirth) : '---'} />
                </>
              )}

              {role === 'doctor' && (
                <>
                  <DetailRow label="Speciality" value={p.speciality} />
                  <DetailRow label="Experience" value={p.experienceYears ? `${p.experienceYears} years` : '---'} />
                  <DetailRow label="Consultation Fee" value={p.consultationFee ? formatCurrency(p.consultationFee) : '---'} />
                  <DetailRow label="BMDC Reg No." value={p.bmdcRegistrationNumber} />
                  <DetailRow label="Rating" value={p.rating ? `${p.rating} / 5` : 'No ratings'} />
                </>
              )}

              {role === 'assistant' && (
                <DetailRow label="City" value={p.city} />
              )}
            </div>

            {p.qualifications?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-500 mb-2">Qualifications</p>
                <ul className="space-y-1">
                  {p.qualifications.map((q, i) => (
                    <li key={i} className="text-sm text-gray-700">
                      {q.degree}{q.institution ? ` — ${q.institution}` : ''}{q.year ? ` (${q.year})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {p.biography && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-500 mb-1">Biography</p>
                <p className="text-sm text-gray-700">{p.biography}</p>
              </div>
            )}

            <Button onClick={() => setEditing(true)} className="w-full mt-6">
              Edit Profile
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
