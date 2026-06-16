'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import AppointmentCard from '@/components/appointment/AppointmentCard';
import { isAuthenticated } from '@/lib/auth';

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/v1/appointments?limit=50');
      const data = await res.json();
      setAppointments(data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter((a) => a.status === filter);

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Appointments</h1>

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'confirmed', 'checked_in', 'completed', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500">No appointments found.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((a) => (
            <AppointmentCard key={a.id} appointment={a} onUpdate={fetchAppointments} />
          ))}
        </div>
      )}
    </div>
  );
}
