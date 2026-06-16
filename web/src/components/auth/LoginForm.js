'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { loginUser, getDashboardUrl } from '@/lib/auth';

export default function LoginForm() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginUser(phone, password);
      const user = result.data?.user;
      if (user) {
        router.push(getDashboardUrl(user.role));
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

      {error && (
        <div className="bg-danger-50 text-danger-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
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
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600 space-y-2">
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-primary-600 hover:underline">
            Register
          </Link>
        </p>
        <p>
          <Link href="/auth/forgot-password" className="text-primary-600 hover:underline">
            Forgot Password?
          </Link>
        </p>
      </div>
    </Card>
  );
}
