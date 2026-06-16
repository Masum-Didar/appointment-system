'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { isAuthenticated } from '@/lib/auth';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/v1/admin/doctors?limit=100');
      const data = await res.json();
      setDoctors(data.data?.doctors || data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const verifyDoctor = async (id, verified) => {
    try {
      await fetch(`/api/v1/admin/doctors/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified }),
      });
      fetchDoctors();
    } catch {}
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Doctor Management</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-3">Name</th>
              <th className="pb-3">Speciality</th>
              <th className="pb-3">BM&DC</th>
              <th className="pb-3">Verified</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d.id} className="border-b last:border-0">
                <td className="py-3 font-medium">{d.name}</td>
                <td className="py-3">{d.speciality}</td>
                <td className="py-3 text-xs">{d.bmdcNumber}</td>
                <td className="py-3">
                  <Badge status={d.isVerified ? 'verified' : 'pending'} />
                </td>
                <td className="py-3 flex gap-2">
                  {!d.isVerified && (
                    <Button onClick={() => verifyDoctor(d.id, true)} size="sm">
                      Verify
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => verifyDoctor(d.id, false)}
                  >
                    Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
