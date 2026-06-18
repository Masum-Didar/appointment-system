'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { isAuthenticated, getStoredUser } from '@/lib/auth';
import authFetch from '@/lib/authFetch';
import { formatDate } from '@/lib/utils';

export default function AdminProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({});
  const currentUser = getStoredUser();
  const isOwner = currentUser?.id === params.id;
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    if (!isOwner) {
      router.push('/dashboard');
      return;
    }
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Admin Profile</h1>

      <Card className="p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-danger-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow">
            {(profile.profile?.name || profile.name || 'A').charAt(0)}
          </div>
          <h2 className="text-xl font-bold mt-3">{profile.profile?.name || profile.name || 'Admin'}</h2>
          <Badge status="admin" />
        </div>

        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input label="Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Phone" value={profile.phone || ''} disabled />
            <Input label="Email" type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={updating} className="flex-1">Save</Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
            </div>
          </form>
        ) : (
          <>
            <div className="divide-y divide-gray-100 w-full">
              <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                <span className="text-sm text-gray-500">Phone</span>
                <span className="font-medium text-sm">{profile.phone || '---'}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                <span className="text-sm text-gray-500">Email</span>
                <span className="font-medium text-sm">{profile.email || '---'}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                <span className="text-sm text-gray-500">Role</span>
                <span className="font-medium text-sm capitalize">{profile.role || 'admin'}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-sm text-gray-500">Member Since</span>
                <span className="font-medium text-sm">{profile.createdAt ? formatDate(profile.createdAt) : '---'}</span>
              </div>
            </div>

            {(isOwner || isAdmin) && (
              <Button onClick={() => setEditing(true)} className="w-full mt-6">
                Edit Profile
              </Button>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
