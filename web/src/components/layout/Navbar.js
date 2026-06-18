'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { getStoredUser, logoutUser } from '@/lib/auth';

function UserAvatar({ user }) {
  const name = user.profile?.name || '';
  const avatarUrl = user.profile?.avatarUrl;
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-8 h-8 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold">
      {initials || '?'}
    </div>
  );
}

const navLinks = [
  { label: 'Find Doctors', href: '/doctors' },
  { label: 'Book Appointment', href: '/appointments/book' },
  { label: 'Live Queue', href: '/queue/live' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();

  const handleLogout = async () => {
    await logoutUser();
    router.push('/');
  };

  if (pathname.startsWith('/auth')) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-primary-600 shrink-0">
              HealthQueue
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href={
                    user.role === 'doctor' ? `/doctors/${user.profile?.id}` :
                    user.role === 'assistant' ? `/admin/assistants/${user.profile?.id}` :
                    user.role === 'admin' ? `/admin/${user.profile?.id}` :
                    '/profile'
                  }
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  <UserAvatar user={user} />
                  <span className="font-medium">{user.profile?.name || 'User'}</span>
                </Link>
                <button onClick={handleLogout} className="btn-secondary text-sm py-1.5">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-secondary text-sm">
                  Login
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm">
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2" />
            {user ? (
              <>
                <Link
                  href={
                    user.role === 'doctor' ? `/doctors/${user.profile?.id}` :
                    user.role === 'assistant' ? `/admin/assistants/${user.profile?.id}` :
                    user.role === 'admin' ? `/admin/${user.profile?.id}` :
                    '/profile'
                  }
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  <UserAvatar user={user} />
                  <span className="font-medium">{user.profile?.name || 'User'}</span>
                </Link>
                <button onClick={handleLogout} className="block px-3 py-2 text-sm text-red-600 w-full text-left">Logout</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block px-3 py-2 text-sm" onClick={() => setIsOpen(false)}>Login</Link>
                <Link href="/auth/register" className="block px-3 py-2 text-sm text-primary-600" onClick={() => setIsOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
