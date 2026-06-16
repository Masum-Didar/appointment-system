'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import ScheduleView from '@/components/doctor/ScheduleView';

function ProfileContent() {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    fetchDoctor();
  }, [id]);

  const fetchDoctor = async () => {
    try {
      const res = await fetch(`/api/v1/doctors/${id}`);
      const data = await res.json();
      setDoctor(data.data);
    } catch {
      setDoctor(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;
  if (!doctor) return <p className="text-gray-500">Doctor not found.</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
            {doctor.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{doctor.name}</h1>
            <p className="text-primary-600">{doctor.speciality}</p>
            <p className="text-gray-500 text-sm mt-1">{doctor.qualification}</p>
            <p className="text-gray-500 text-sm">{doctor.experience} years experience</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-2">About</h2>
        <p className="text-gray-600">{doctor.bio || 'No bio available.'}</p>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Schedule</h2>
        <ScheduleView doctorId={doctor.id} />
      </Card>

      <Button className="w-full">Book Appointment</Button>
    </div>
  );
}

export default function DoctorProfilePage() {
  return (
    <Suspense fallback={<Spinner className="py-20" />}>
      <ProfileContent />
    </Suspense>
  );
}
