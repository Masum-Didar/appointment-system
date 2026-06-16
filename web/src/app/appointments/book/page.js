'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BookAppointment from '@/components/appointment/BookAppointment';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { isAuthenticated } from '@/lib/auth';

function BookContent() {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const doctorId = searchParams.get('doctorId');

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    if (!doctorId) { setLoading(false); return; }
    fetchDoctor();
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const res = await fetch(`/api/v1/doctors/${doctorId}`);
      const data = await res.json();
      setDoctor(data.data);
    } catch {
      setDoctor(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Book Appointment</h1>

      {doctor && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              {doctor.name?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold">{doctor.name}</p>
              <p className="text-sm text-gray-500">{doctor.speciality}</p>
            </div>
          </div>
        </Card>
      )}

      <BookAppointment doctorId={doctorId} />
    </div>
  );
}

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={<Spinner className="py-20" />}>
      <BookContent />
    </Suspense>
  );
}
