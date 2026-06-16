'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { isAuthenticated, getStoredUser } from '@/lib/auth';
import authFetch from '@/lib/authFetch';
import { formatCurrency } from '@/lib/utils';

export default function AdminDoctorProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    const user = getStoredUser();
    if (user?.role !== 'admin') { router.push('/dashboard'); return; }
    fetchDoctor();
  }, []);

  const fetchDoctor = async () => {
    try {
      const res = await authFetch(`/api/v1/admin/doctors/${params.id}`);
      if (!res.ok) throw new Error(res.statusText);
      const d = await res.json();
      if (!d.data) throw new Error('Doctor not found');
      setDoctor(d.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;
  if (error) return <p className="text-center py-20 text-red-500">{error}</p>;
  if (!doctor) return <p className="text-center py-20 text-gray-500">Doctor not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/doctors" className="text-primary-600 hover:underline text-sm">&larr; Back to Doctors</Link>
      </div>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{doctor.name}</h1>
            <p className="text-gray-500">{doctor.speciality}</p>
          </div>
          <Badge status={doctor.isVerified ? 'verified' : 'pending'} />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div>
            <p className="text-sm text-gray-500">Experience</p>
            <p className="font-medium">{doctor.experienceYears} years</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Consultation Fee</p>
            <p className="font-medium">{doctor.consultationFee ? formatCurrency(doctor.consultationFee) : '---'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Follow-up Fee</p>
            <p className="font-medium">{doctor.followUpFee ? formatCurrency(doctor.followUpFee) : '---'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">BMDC Reg No.</p>
            <p className="font-medium">{doctor.bmdcRegistrationNumber || '---'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Rating</p>
            <p className="font-medium">{doctor.rating ? `${doctor.rating} / 5` : 'No ratings'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Appointments</p>
            <p className="font-medium">{doctor.totalAppointments || 0}</p>
          </div>
        </div>

        {doctor.biography && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-1">Biography</p>
            <p className="text-gray-700">{doctor.biography}</p>
          </div>
        )}

        {doctor.qualifications?.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-1">Qualifications</p>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {doctor.qualifications.map((q, i) => (
                <li key={i}>{q.degree} - {q.institution} ({q.year})</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <h2 className="text-xl font-semibold">Chambers & Assistants</h2>

      {doctor.chambers?.length === 0 ? (
        <p className="text-gray-500">No chambers found for this doctor.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {doctor.chambers.map(chamber => (
            <Card key={chamber.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{chamber.name}</h3>
                  <p className="text-sm text-gray-500">{chamber.address}, {chamber.city}</p>
                </div>
                <Badge status={chamber.isActive ? 'active' : 'inactive'} />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Assistants ({chamber.assistants?.length || 0})
                </p>
                {chamber.assistants?.length === 0 ? (
                  <p className="text-sm text-gray-400">No assistants assigned.</p>
                ) : (
                  <div className="space-y-1">
                    {chamber.assistants.map(a => (
                      <div key={a.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                        <div>
                          <Link href={`/admin/assistants/${a.userId}`} className="text-primary-600 hover:underline font-medium">
                            {a.name}
                          </Link>
                          <span className="text-gray-400 ml-2">{a.phone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
