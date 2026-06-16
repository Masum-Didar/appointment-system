'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { isAuthenticated } from '@/lib/auth';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/v1/payments?limit=50');
      const data = await res.json();
      setPayments(data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payment History</h1>

      {payments.length === 0 ? (
        <p className="text-gray-500">No payments yet.</p>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <Card key={p.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{p.doctor?.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">TXN: {p.transactionId}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{formatCurrency(p.amount)}</p>
                  <Badge status={p.status} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
