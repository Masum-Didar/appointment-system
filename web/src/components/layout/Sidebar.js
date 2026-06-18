'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getStoredUser, getDashboardUrl } from '@/lib/auth';

export default function Sidebar() {
  const pathname = usePathname();
  const user = getStoredUser();

  if (!user || pathname === '/' || pathname.startsWith('/auth')) return null;

  const menuItems = {
    patient: [
      { label: 'Dashboard', href: '/dashboard', icon: '📊' },
      { label: 'Find Doctors', href: '/doctors', icon: '🔍' },
      { label: 'My Appointments', href: '/appointments', icon: '📅' },
    ],
    doctor: [
      { label: 'Dashboard', href: '/dashboard/doctor', icon: '📊' },
      { label: 'My Profile', href: '/dashboard/doctor/profile', icon: '👤' },
      { label: 'Today\'s Queue', href: '/queue', icon: '👥' },
      { label: 'Appointments', href: '/appointments', icon: '📅' },
    ],
    assistant: [
      { label: 'Dashboard', href: '/dashboard/assistant', icon: '📊' },
      { label: 'My Profile', href: '/assistants/profile', icon: '👤' },
      { label: 'Manage Queue', href: '/queue', icon: '👥' },
      { label: 'Appointments', href: '/appointments', icon: '📅' },
    ],
    admin: [
      { label: 'Dashboard', href: '/dashboard/admin', icon: '📊' },
      { label: 'Users', href: '/admin/users', icon: '👤' },
      { label: 'Doctors', href: '/admin/doctors', icon: '🩺' },
      { label: 'Assistants', href: '/admin/assistants', icon: '👥' },
      { label: 'Chambers', href: '/admin/chambers', icon: '🏥' },
      { label: 'Appointments', href: '/dashboard/admin?tab=appointments', icon: '📅' },
      { label: 'Analytics', href: '/dashboard/admin?tab=analytics', icon: '📈' },
    ],
  };

  const items = menuItems[user.role] || [];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] hidden md:block">
      <nav className="p-4 space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === item.href
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
