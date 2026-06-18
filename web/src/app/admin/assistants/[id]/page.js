'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { isAuthenticated, getStoredUser } from '@/lib/auth';
import authFetch from '@/lib/authFetch';
import { formatDate } from '@/lib/utils';

export default function AdminAssistantProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [assistant, setAssistant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUser = getStoredUser();
  const isOwner = currentUser?.id === params.id;
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    fetchAssistant();
  }, []);

  const fetchAssistant = async () => {
    try {
      const res = await authFetch(`/api/v1/admin/users/${params.id}`);
      if (!res.ok) throw new Error(res.statusText);
      const d = await res.json();
      if (!d.data) throw new Error('Assistant not found');
      setAssistant(d.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;
  if (error) return <p className="text-center py-20 text-red-500">{error}</p>;
  if (!assistant) return <p className="text-center py-20 text-gray-500">Assistant not found.</p>;

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex items-center gap-3">
          <Link href="/admin/users" className="text-primary-600 hover:underline text-sm">&larr; Back to Users</Link>
        </div>
      )}

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{assistant.profile?.name || assistant.phone}</h1>
            <p className="text-gray-500">Assistant</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge status={assistant.isActive ? 'active' : 'inactive'} />
            {(isOwner || isAdmin) && (
              <Link href={`/admin/assistants/${params.id}/edit`} className="btn-secondary text-sm px-3 py-1.5 rounded-lg">
                Edit
              </Link>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{assistant.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{assistant.email || '---'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Verified</p>
            <p className="font-medium">{assistant.isVerified ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Joined</p>
            <p className="font-medium">{assistant.createdAt ? formatDate(assistant.createdAt) : '---'}</p>
          </div>
        </div>
      </Card>

      {assistant.chamber && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-3">Assigned Chamber</h2>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-lg">{assistant.chamber.name}</p>
              <p className="text-sm text-gray-500">{assistant.chamber.address}, {assistant.chamber.city}</p>
            </div>
          </div>

          {assistant.chamber.doctor && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Doctor</p>
              <Link
                href={`/admin/doctors/${assistant.chamber.doctor.id}`}
                className="text-primary-600 hover:underline font-medium"
              >
                {assistant.chamber.doctor.name}
              </Link>
              <span className="text-gray-400 ml-2 text-sm">({assistant.chamber.doctor.speciality})</span>
            </div>
          )}
        </Card>
      )}

      {!assistant.chamber && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-3">Assigned Chamber</h2>
          <p className="text-gray-500">Not assigned to any chamber yet.</p>
        </Card>
      )}
    </div>
  );
}
