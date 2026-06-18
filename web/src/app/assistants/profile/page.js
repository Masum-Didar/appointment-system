'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { isAuthenticated, getStoredUser } from '@/lib/auth';
import authFetch from '@/lib/authFetch';
import { formatDate } from '@/lib/utils';

export default function AssistantProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '' });

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    const user = getStoredUser();
    if (user?.role !== 'assistant') { router.push('/dashboard'); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authFetch('/api/v1/assistants/me');
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      setProfile(data.data);
      setForm({
        name: data.data.profile?.name || '',
        phone: data.data.phone || '',
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
    try {
      const res = await authFetch('/api/v1/assistants/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || 'Failed to update profile');
      }
      const data = await res.json();
      setProfile(data.data);
      setEditing(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;
  if (!profile) return <p className="text-center py-20 text-red-500">{error || 'Profile not found.'}</p>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center text-2xl font-bold text-secondary-600 shrink-0">
              {profile.profile?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.profile?.name || profile.phone}</h1>
              <p className="text-gray-500">Assistant</p>
              <div className="mt-2">
                <Badge status={profile.isActive ? 'active' : 'inactive'} />
              </div>
            </div>
          </div>
          <Button onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </Card>

      {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Profile' : 'Profile Details'}</h2>

        {editing ? (
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              required
            />
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{profile.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{profile.email || '---'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Joined</p>
              <p className="font-medium">{profile.createdAt ? formatDate(profile.createdAt) : '---'}</p>
            </div>
          </div>
        )}
      </Card>

      {profile.chamber && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-3">Assigned Chamber</h2>
          <div>
            <p className="font-medium text-lg">{profile.chamber.name}</p>
            <p className="text-sm text-gray-500">{profile.chamber.address}, {profile.chamber.city}</p>
          </div>
          {profile.chamber.doctor && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Works with Doctor</p>
              <Link
                href={`/doctors/${profile.chamber.doctor.id}`}
                className="text-primary-600 hover:underline font-medium"
              >
                {profile.chamber.doctor.name}
              </Link>
              <span className="text-gray-400 ml-2 text-sm">({profile.chamber.doctor.speciality})</span>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
