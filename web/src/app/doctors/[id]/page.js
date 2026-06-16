'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { getDayName, formatTime, formatCurrency } from '@/lib/utils';

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) { setLoading(false); return; }
    fetchDoctor();
  }, [params.id]);

  const fetchDoctor = async () => {
    try {
      const res = await fetch(`/api/v1/doctors/${params.id}`);
      const data = await res.json();
      setDoctor(data.data);
    } catch {
      setDoctor(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;
  if (!doctor) return <p className="text-gray-500 text-center py-10">Doctor not found.</p>;

  const allSchedules = doctor.chambers?.flatMap(c =>
    (c.schedules || []).map(s => ({ ...s, chamberName: c.name, chamberId: c.id }))
  ) || [];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600 shrink-0">
            {doctor.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{doctor.name}</h1>
            <p className="text-primary-600">{doctor.speciality}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>⭐ {doctor.rating || '0.0'}</span>
              <span>{doctor.experienceYears || 0} yrs exp</span>
              {doctor.consultationFee ? (
                <span className="font-medium text-gray-900">{formatCurrency(doctor.consultationFee)}</span>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-2">About</h2>
        <p className="text-gray-600">{doctor.biography || 'No bio available.'}</p>
      </Card>

      {doctor.qualifications?.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">Qualifications</h2>
          <ul className="space-y-2">
            {doctor.qualifications.map((q, i) => (
              <li key={i} className="text-sm text-gray-600">
                {q.degree}{q.institution ? ` — ${q.institution}` : ''}{q.year ? ` (${q.year})` : ''}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {allSchedules.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Schedule</h2>
          <div className="space-y-3">
            {allSchedules.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{getDayName(s.dayOfWeek)}</p>
                  <p className="text-xs text-gray-500">{s.chamberName}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-gray-700">{formatTime(s.startTime)} - {formatTime(s.endTime)}</p>
                  <p className="text-xs text-gray-500">{s.maxPatients} patients</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Button className="w-full" onClick={() => router.push(`/appointments/book?doctorId=${doctor.id}`)}>
        Book Appointment
      </Button>
    </div>
  );
}
