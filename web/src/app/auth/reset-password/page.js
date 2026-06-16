'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import api from '@/lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      await api.resetPassword(phone, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!phone) {
    return (
      <Card className="max-w-md mx-auto mt-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Request</h1>
        <p className="text-gray-600 mb-4">No phone number provided. Please start again.</p>
        <Link href="/auth/forgot-password" className="text-primary-600 hover:underline">
          Go to Forgot Password
        </Link>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="max-w-md mx-auto mt-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Password Reset Successful</h1>
        <p className="text-success-700 bg-success-50 p-3 rounded-lg mb-4">
          Your password has been reset. You can now log in with your new password.
        </p>
        <Button className="w-full" onClick={() => router.push('/auth/login')}>
          Go to Login
        </Button>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
      <p className="text-center text-gray-600 mb-6">
        Enter your new password for {phone}.
      </p>

      {error && (
        <p className="text-red-600 bg-red-50 p-3 rounded-lg mb-4 text-center">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={8}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
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
