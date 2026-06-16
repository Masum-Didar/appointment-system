'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { registerUser } from '@/lib/auth';

export default function RegisterForm() {
  const [form, setForm] = useState({
    name: '', phone: '', password: '', role: 'patient',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser(form);
      router.push(`/auth/verify-otp?phone=${encodeURIComponent(form.phone)}`);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold text-center mb-6">Register</h1>

      {error && (
        <div className="bg-danger-50 text-danger-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Your full name"
          value={form.name}
          onChange={update('name')}
          required
        />
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+8801XXXXXXXXX"
          value={form.phone}
          onChange={update('phone')}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min 8 chars, upper, lower, number & special"
          value={form.password}
          onChange={update('password')}
          required
          minLength={8}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          value={form.confirmPassword || ''}
          onChange={update('confirmPassword')}
          required
          minLength={8}
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">I am a</label>
          <select
            className="input-field"
            value={form.role}
            onChange={update('role')}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="assistant">Assistant</option>
          </select>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary-600 hover:underline">
          Login
        </Link>
      </p>
    </Card>
  );
}
