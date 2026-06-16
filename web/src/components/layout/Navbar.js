'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { getStoredUser, logoutUser, getDashboardUrl } from '@/lib/auth';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();

  const handleLogout = async () => {
    await logoutUser();
    router.push('/auth/login');
  };

  if (pathname.startsWith('/auth')) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary-600">
              HealthQueue
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link href={getDashboardUrl(user.role)} className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/appointments" className="text-gray-600 hover:text-gray-900">
                  Appointments
                </Link>
                <span className="text-sm text-gray-500">
                  {user.profile?.name || user.phone}
                </span>
                <button onClick={handleLogout} className="btn-secondary text-sm py-1.5">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                  Login
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
