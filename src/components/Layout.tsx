import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black flex items-center justify-center">
      <main className="w-full">
        {children}
      </main>
    </div>
  );
} 