'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_BY_ROLE = {
  doctor: [
    { href: '/doctor', label: 'Queue', icon: '📋' },
    { href: '/doctor/h1-register', label: 'H1 Reg', icon: '📕' },
    { href: '/doctor/settings', label: 'Settings', icon: '⚙️' },
  ],
  receptionist: [
    { href: '/receptionist', label: 'New', icon: '➕' },
  ],
  pharmacy: [
    { href: '/pharmacy', label: 'Queue', icon: '💊' },
  ],
};

export default function BottomNav({ role }) {
  const pathname = usePathname();
  const items = NAV_BY_ROLE[role] || [];

  if (items.length === 0) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex md:hidden">
      {items.map(item => {
        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-[11px] font-semibold transition ${active ? 'text-emerald-600' : 'text-gray-500'}`}
          >
            <span className="text-xl leading-none mb-0.5">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => {
          fetch('/api/auth/logout', { method: 'POST' }).then(() => {
            window.location.href = '/login';
          });
        }}
        className="flex-1 flex flex-col items-center justify-center py-2 text-[11px] font-semibold text-red-500"
      >
        <span className="text-xl leading-none mb-0.5">🚪</span>
        <span>Logout</span>
      </button>
    </nav>
  );
}