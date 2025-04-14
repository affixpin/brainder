'use client';

import Link from 'next/link';
import { Home, Compass, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-50">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-around">
        <Link 
          href="/feed" 
          className={`flex flex-col items-center ${pathname === '/feed' ? 'text-white' : 'text-white/50'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link 
          href="/discover" 
          className={`flex flex-col items-center ${pathname === '/discover' ? 'text-white' : 'text-white/50'}`}
        >
          <Compass className="w-6 h-6" />
          <span className="text-xs mt-1">Discover</span>
        </Link>
        <Link 
          href="/profile" 
          className={`flex flex-col items-center ${pathname === '/profile' ? 'text-white' : 'text-white/50'}`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
} 