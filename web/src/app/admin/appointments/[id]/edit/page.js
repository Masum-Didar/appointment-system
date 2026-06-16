'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { isAuthenticated, getStoredUser } from '@/lib/auth';
import authFetch from '@/lib/authFetch';
import { formatDate } from '@/lib/utils';

const STATUSES = ['pending', 'confirmed', 'checked_in', 'in_consultation', 'completed', 'cancelled', 'missed'];

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState({ status: '', symptoms: '', notes: '', cancelReason: '', consultationFee: '' });
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    const user = getStoredUser();
    if (user?.role !== 'admin') { router.push('/dashboard'); return; }
    fetchAppointment();
  }, []);

  const fetchAppointment = async () => {
    try {
      const res = await authFetch(`/api/v1/admin/appointments/${params.id}`);
      if (!res.ok) throw new Error('Appointment not found');
      const d = await res.json();
      const a = d.data;
      setAppointment(a);
      setForm({
        status: a.status || 'pending',
        symptoms: a.symptoms || '',
        notes: a.notes || '',
        cancelReason: a.cancelReason || '',
        consultationFee: a.consultationFee?.toString() || '',
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = {
        status: form.status,
        symptoms: form.symptoms || null,
        notes: form.notes || null,
        consultationFee: form.consultationFee ? parseFloat(form.consultationFee) : undefined,
      };
      if (form.status === 'cancelled' && form.cancelReason) {
        body.cancelReason = form.cancelReason;
      }
      const res = await authFetch(`/api/v1/admin/appointments/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Failed to update appointment');
      router.push('/admin/appointments');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner className="py-20" />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/appointments" className="text-primary-600 hover:underline text-sm">&larr; Back to Appointments</Link>
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-2">Edit Appointment</h1>
        {appointment && (
          <p className="text-sm text-gray-500 mb-6">
            {appointment.patient?.name} &middot; {appointment.doctor?.name} &middot; {appointment.appointmentDate ? formatDate(appointment.appointmentDate) : ''}
          </p>
        )}

        {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <Input label="Consultation Fee" type="number" value={form.consultationFee} onChange={e => setForm(f => ({ ...f, consultationFee: e.target.value }))} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
            <textarea className="input-field" rows={2} value={form.symptoms} onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>

          {form.status === 'cancelled' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cancel Reason</label>
              <textarea className="input-field" rows={2} value={form.cancelReason} onChange={e => setForm(f => ({ ...f, cancelReason: e.target.value }))} />
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            <Link href="/admin/appointments" className="btn-secondary inline-flex items-center px-4 py-2 text-sm rounded-lg border">Cancel</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
