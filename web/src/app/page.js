'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import DoctorCard from '@/components/doctor/DoctorCard';
import Spinner from '@/components/ui/Spinner';

export default function HomePage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/v1/doctors')
      .then((res) => res.json())
      .then((data) => setDoctors(data.data || []))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.speciality?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <section className="text-center py-12 bg-gradient-to-br from-primary-50 to-white -mx-6 -mt-6 px-6 rounded-b-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Find the Right Doctor for You
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
          Search, book appointments, and track live queues — all in one place.
        </p>
        <div className="max-w-md mx-auto">
          <Input
            placeholder="Search by doctor name or speciality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {search ? `Search Results (${filtered.length})` : 'All Doctors'}
        </h2>
        <Link href="/doctors" className="text-sm text-primary-600 hover:underline">
          View All &rarr;
        </Link>
      </div>

      {loading ? (
        <Spinner className="py-20" />
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          {search ? 'No doctors match your search.' : 'No doctors available at the moment.'}
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.slice(0, 6).map((d) => (
            <DoctorCard key={d.id} doctor={d} />
          ))}
        </div>
      )}
    </div>
  );
}
