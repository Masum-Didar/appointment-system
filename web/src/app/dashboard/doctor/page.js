'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import QueueControls from '@/components/queue/QueueControls';
import QueueDisplay from '@/components/queue/QueueDisplay';
import { isAuthenticated, getStoredUser } from '@/lib/auth';

export default function DoctorDashboard() {
  const [stats, setStats] = useState(null);
  const [todayApps, setTodayApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appsRes, todayRes] = await Promise.all([
        fetch('/api/v1/appointments/today'),
        fetch('/api/v1/appointments?dateFrom=today&dateTo=today'),
      ]);
      const apps = await appsRes.json();
      setTodayApps(apps.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;

  const completed = todayApps.filter(a => a.status === 'completed').length;
  const waiting = todayApps.filter(a => ['confirmed', 'checked_in'].includes(a.status)).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Doctor Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary-600">{todayApps.length}</p>
          <p className="text-sm text-gray-500">Today Total</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-success-600">{completed}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-warning-600">{waiting}</p>
          <p className="text-sm text-gray-500">Waiting</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-danger-600">
            {todayApps.filter(a => a.status === 'in_consultation').length}
          </p>
          <p className="text-sm text-gray-500">In Consultation</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Today&apos;s Queue</h2>
        <QueueControls chamberId="current" onUpdate={fetchData} />
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Today&apos;s Appointments</h2>
        <div className="space-y-3">
          {todayApps.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">#{a.serialNumber}</span>
                  <div>
                    <p className="font-medium">{a.patient?.name}</p>
                    <p className="text-sm text-gray-500">{a.symptoms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={a.status} />
                  <span className="text-sm text-gray-500">{a.tokenNumber}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
