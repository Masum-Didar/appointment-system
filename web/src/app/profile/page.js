'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { isAuthenticated, getStoredUser } from '@/lib/auth';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/v1/auth/profile');
      const data = await res.json();
      setProfile(data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) fetchProfile();
    } catch {
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <Card className="p-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Name"
            value={profile?.name || ''}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={profile?.phone || ''}
            disabled
            helperText="Phone number cannot be changed"
          />
          <Input
            label="Email"
            type="email"
            value={profile?.email || ''}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
          <Input
            label="Address"
            value={profile?.address || ''}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
          />
          <Button type="submit" loading={updating} className="w-full">
            Update Profile
          </Button>
        </form>
      </Card>
    </div>
  );
}
