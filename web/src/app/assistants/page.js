'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Input from '@/components/ui/Input';
import AssistantCard from '@/components/assistant/AssistantCard';
import { isAuthenticated } from '@/lib/auth';
import authFetch from '@/lib/authFetch';

export default function AssistantsPage() {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      const res = await authFetch('/api/v1/assistants');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setAssistants(data.data || []);
    } catch {
      setAssistants([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = assistants.filter((a) =>
    a.profile?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.phone?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Assistants</h1>

      <Input
        placeholder="Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-10">No assistants found.</p>
        ) : (
          filtered.map((a) => (
            <AssistantCard
              key={a.id}
              assistant={a}
            />
          ))
        )}
      </div>
    </div>
  );
}
