'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Input from '@/components/ui/Input';
import DoctorCard from '@/components/doctor/DoctorCard';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/v1/doctors');
      const data = await res.json();
      setDoctors(data.data?.doctors || data.data || []);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = doctors.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.speciality?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Find a Doctor</h1>

      <Input
        placeholder="Search by name or speciality..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-10">No doctors found.</p>
        ) : (
          filtered.map((d) => (
            <DoctorCard
              key={d.id}
              doctor={d}
              onBook={() => router.push(`/appointments/book?doctorId=${d.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
