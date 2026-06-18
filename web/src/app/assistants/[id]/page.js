'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { isAuthenticated, getStoredUser } from '@/lib/auth';
import authFetch from '@/lib/authFetch';
import { formatDate } from '@/lib/utils';

export default function AssistantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [assistant, setAssistant] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUser = getStoredUser();
  const isOwner = currentUser?.id === params.id;

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    if (!params.id) { setLoading(false); return; }
    fetchAssistant();
  }, [params.id]);

  const fetchAssistant = async () => {
    try {
      const res = await authFetch(`/api/v1/assistants/${params.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Assistant not found');
      setAssistant(data.data);
    } catch {
      setAssistant(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;
  if (!assistant) return <p className="text-gray-500 text-center py-10">Assistant not found.</p>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center text-2xl font-bold text-secondary-600 shrink-0">
              {assistant.profile?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{assistant.profile?.name || assistant.phone}</h1>
              <p className="text-gray-500">Assistant</p>
              <div className="mt-2">
                <Badge status={assistant.isActive ? 'active' : 'inactive'} />
              </div>
            </div>
          </div>
          {isOwner && (
            <Link
              href={`/assistants/profile`}
              className="btn-secondary text-sm px-3 py-1.5 rounded-lg"
            >
              Edit Profile
            </Link>
          )}
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
            <p className="text-sm text-gray-500">Joined</p>
            <p className="font-medium">{assistant.createdAt ? formatDate(assistant.createdAt) : '---'}</p>
          </div>
        </div>
      </Card>

      {assistant.chamber && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-3">Assigned Chamber</h2>
          <div>
            <p className="font-medium text-lg">{assistant.chamber.name}</p>
            <p className="text-sm text-gray-500">{assistant.chamber.address}, {assistant.chamber.city}</p>
          </div>

          {assistant.chamber.doctor && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Works with Doctor</p>
              <Link
                href={`/doctors/${assistant.chamber.doctor.id}`}
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
