'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { isAuthenticated } from '@/lib/auth';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/v1/admin/dashboard');
      const data = await res.json();
      setStats(data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary-600">{stats?.users?.total || 0}</p>
          <p className="text-sm text-gray-500">Total Users</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-success-600">{stats?.doctors?.total || 0}</p>
          <p className="text-sm text-gray-500">Doctors</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-warning-600">{stats?.patients?.total || 0}</p>
          <p className="text-sm text-gray-500">Patients</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary-600">{stats?.unverifiedDoctors?.total || 0}</p>
          <p className="text-sm text-gray-500">Unverified Doctors</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-3">Appointments</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Today</span>
              <span className="font-medium">{stats?.appointments?.today || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Completed</span>
              <span className="font-medium text-success-600">{stats?.appointments?.completed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cancelled</span>
              <span className="font-medium text-danger-600">{stats?.appointments?.cancelled || 0}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-3">Revenue</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="font-medium">৳{stats?.revenue?.total?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Successful</span>
              <span className="font-medium text-success-600">{stats?.revenue?.successfulTransactions || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Failed</span>
              <span className="font-medium text-danger-600">{stats?.revenue?.failedTransactions || 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
