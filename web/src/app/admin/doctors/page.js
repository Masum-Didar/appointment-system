'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { isAuthenticated, getStoredUser } from '@/lib/auth';
import authFetch from '@/lib/authFetch';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    const user = getStoredUser();
    if (user?.role !== 'admin') { router.push('/dashboard'); return; }
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await authFetch('/api/v1/admin/doctors?limit=100');
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setDoctors(data.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyDoctor = async (id, isVerified) => {
    try {
      const res = await authFetch(`/api/v1/admin/doctors/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified }),
      });
      if (res.ok) fetchDoctors();
    } catch {}
  };

  if (loading) return <Spinner className="py-20" />;
  if (error) return <p className="text-center py-20 text-red-500">Error: {error}</p>;
  if (doctors.length === 0) return <p className="text-center py-20 text-gray-500">No doctors found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Doctor Management</h1>
        <Link href="/admin/doctors/new"><Button>+ Add Doctor</Button></Link>
      </div>

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
                <td className="py-3 font-medium"><Link href={`/admin/doctors/${d.id}`} className="text-primary-600 hover:underline">{d.name}</Link></td>
                <td className="py-3">{d.speciality}</td>
                <td className="py-3 text-xs">{d.bmdcRegistrationNumber}</td>
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
