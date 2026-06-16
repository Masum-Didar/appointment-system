'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <Card className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold text-center mb-2">Forgot Password</h1>
      <p className="text-center text-gray-600 mb-6">
        {sent ? 'Password reset link sent to your phone' : 'Enter your phone number to reset password'}
      </p>

      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+8801XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">Send Reset Link</Button>
        </form>
      ) : (
        <div className="text-center">
          <p className="text-success-700 bg-success-50 p-3 rounded-lg mb-4">
            Check your phone for the OTP to reset your password.
          </p>
          <Link href="/auth/login" className="text-primary-600 hover:underline">
            Back to Login
          </Link>
        </div>
      )}
    </Card>
  );
}
