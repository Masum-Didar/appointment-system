'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { verifyOtp } from '@/lib/auth';

export default function OTPForm() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await verifyOtp(phone, otp);
      const user = result.data?.user;
      if (user) {
        const urls = { patient: '/dashboard', doctor: '/dashboard/doctor', assistant: '/dashboard/assistant', admin: '/dashboard/admin' };
        router.push(urls[user.role] || '/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold text-center mb-2">Verify Phone</h1>
      <p className="text-center text-gray-600 mb-6">
        Enter the OTP sent to {phone}
      </p>

      {error && (
        <div className="bg-danger-50 text-danger-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="OTP Code"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          className="text-center text-2xl tracking-widest"
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify'}
        </Button>
      </form>
    </Card>
  );
}
