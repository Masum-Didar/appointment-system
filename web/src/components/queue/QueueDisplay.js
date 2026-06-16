'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';

export default function QueueDisplay({ chamberId }) {
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await fetch(`/api/v1/queue/${chamberId}/live`);
      const data = await res.json();
      setQueue(data.data);
    } catch {
      setQueue(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [chamberId]);

  if (loading) return <Spinner />;
  if (!queue) return <p className="text-gray-500">Queue not available</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-primary-600">
            Now Serving: #{queue.currentSerial}
          </p>
          <p className="text-gray-500">Total: {queue.lastSerial} patients</p>
        </div>
        <Badge status={queue.status} />
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Waiting Patients</h3>
        {queue.waitingPatients?.length > 0 ? (
          queue.waitingPatients.map((p, i) => (
            <Card key={i} className="p-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{p.patientName}</p>
                <p className="text-sm text-gray-500">Token: {p.tokenNumber}</p>
              </div>
              <div className="text-right">
                <Badge status={p.status} />
                <p className="text-sm text-gray-500 mt-1">~{p.estimatedWait} min</p>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No patients waiting</p>
        )}
      </div>
    </div>
  );
}
