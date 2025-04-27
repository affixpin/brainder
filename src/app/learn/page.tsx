'use client';

import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';

export default function LearnPage() {
  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 py-4">
        <h1 className="text-xl font-semibold text-white">Learn</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center text-white/50 py-8"
        >
          Coming soon...
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
} 