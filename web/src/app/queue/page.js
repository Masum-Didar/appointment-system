'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import QueueDisplay from '@/components/queue/QueueDisplay';
import Card from '@/components/ui/Card';

function QueueContent() {
  const chamberId = useSearchParams().get('chamberId');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Live Queue</h1>
      <p className="text-gray-500">
        Real-time queue status for your appointment chamber.
      </p>

      {chamberId ? (
        <QueueDisplay chamberId={chamberId} />
      ) : (
        <Card className="p-6 text-center text-gray-500">
          Enter a chamber ID or scan the QR code at your chamber.
        </Card>
      )}
    </div>
  );
}

export default function LiveQueuePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading...</div>}>
      <QueueContent />
    </Suspense>
  );
}
