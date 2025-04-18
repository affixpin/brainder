'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Settings } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-white/10 px-6 py-2">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <Link
          href="/feed"
          className={`flex flex-col items-center gap-1 p-2 ${
            pathname === '/feed' ? 'text-white' : 'text-white/50'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </Link>

        <Link
          href="/settings"
          className={`flex flex-col items-center gap-1 p-2 ${
            pathname === '/settings' ? 'text-white' : 'text-white/50'
          }`}
        >
          <Settings className="w-6 h-6" />
          <span className="text-xs">Settings</span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center gap-1 p-2 ${
            pathname === '/profile' ? 'text-white' : 'text-white/50'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </nav>
  );
} 