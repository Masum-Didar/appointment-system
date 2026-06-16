'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import { verifyOtp, getDashboardUrl } from '@/lib/auth';

export default function OTPForm() {
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';

  useEffect(() => {
    if (!phone) {
      setError('No phone number provided');
      return;
    }

    verifyOtp(phone, '000000')
      .then((result) => {
        const user = result.data?.user;
        if (user) {
          router.replace(getDashboardUrl(user.role));
        }
      })
      .catch(() => {
        router.replace('/auth/login');
      });
  }, [phone, router]);

  return (
    <Card className="max-w-md mx-auto mt-20 text-center">
      <h1 className="text-2xl font-bold mb-4">Verifying your account...</h1>
      {error && <p className="text-danger-600">{error}</p>}
      {!error && <p className="text-gray-600">Please wait a moment.</p>}
    </Card>
  );
}
