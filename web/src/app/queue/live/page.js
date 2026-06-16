'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import QueueDisplay from '@/components/queue/QueueDisplay';
import Spinner from '@/components/ui/Spinner';

function QueueLiveContent() {
  const chamberId = useSearchParams().get('chamberId') || useSearchParams().get('id');

  if (!chamberId) return <p className="text-gray-500">Invalid chamber ID.</p>;
  return <QueueDisplay chamberId={chamberId} />;
}

export default function QueueLivePage() {
  return (
    <Suspense fallback={<Spinner className="py-20" />}>
      <QueueLiveContent />
    </Suspense>
  );
}
