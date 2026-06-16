'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import QueueControls from '@/components/queue/QueueControls';
import QueueDisplay from '@/components/queue/QueueDisplay';
import { isAuthenticated } from '@/lib/auth';

export default function AssistantDashboard() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    setLoading(false);
  }, []);

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Assistant Dashboard</h1>
      <Card>
        <h2 className="text-lg font-semibold mb-4">Queue Management</h2>
        <QueueControls chamberId="current" />
      </Card>
    </div>
  );
}
