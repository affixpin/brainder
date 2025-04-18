'use client';

import BottomNav from '@/components/BottomNav';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black text-white"
    >
      <div className="bg-black/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        <div className="space-y-4">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-medium mb-2">App Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Dark Mode</span>
                <div className="w-12 h-6 bg-white/10 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Notifications</span>
                <div className="w-12 h-6 bg-white/10 rounded-full relative">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white/50 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-medium mb-2">About</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/70">Version</span>
                <span className="text-white/50">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Build</span>
                <span className="text-white/50">2024.1</span>
              </div>
            </div>
          </div>

          <button className="w-full py-3 text-red-500 font-medium">
            Sign Out
          </button>
        </div>
      </div>

      <BottomNav />
    </motion.div>
  );
} 