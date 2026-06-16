'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { getStoredUser, isAuthenticated } from '@/lib/auth';

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/v1/appointments?limit=5&sort=created_at&order=desc');
      const data = await res.json();
      setAppointments(data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;

  const user = getStoredUser();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Welcome, {user?.profile?.name || 'Patient'}
      </h1>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary-600">{appointments.length}</p>
          <p className="text-sm text-gray-500">Appointments</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-success-600">
            {appointments.filter(a => a.status === 'completed').length}
          </p>
          <p className="text-sm text-gray-500">Completed</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-warning-600">
            {appointments.filter(a => a.status === 'confirmed' || a.status === 'checked_in').length}
          </p>
          <p className="text-sm text-gray-500">Upcoming</p>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Appointments</h2>
        {appointments.length === 0 ? (
          <p className="text-gray-500">No appointments yet.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => (
              <Card key={a.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{a.doctor?.name}</p>
                    <p className="text-sm text-gray-500">{a.chamber?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{a.appointmentDate}</p>
                    <span className="text-xs badge-info">#{a.serialNumber}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
