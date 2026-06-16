'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.forgotPassword(phone);
      router.push(`/auth/reset-password?phone=${encodeURIComponent(phone)}`);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold text-center mb-2">Forgot Password</h1>
      <p className="text-center text-gray-600 mb-6">
        Enter your phone number to reset your password.
      </p>

      {error && (
        <p className="text-red-600 bg-red-50 p-3 rounded-lg mb-4 text-center">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+8801XXXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Checking...' : 'Continue'}
        </Button>
      </form>

      <div className="text-center mt-4">
        <Link href="/auth/login" className="text-primary-600 hover:underline text-sm">
          Back to Login
        </Link>
      </div>
    </Card>
  );
}
