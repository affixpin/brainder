'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Bell, Shield, HelpCircle, LogOut } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);

  // Mock user data - in a real app, this would come from an API or context
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinDate: 'January 2023',
    topicsViewed: 42,
    topicsSaved: 7
  };

  const menuItems = [
    { icon: <User className="w-5 h-5" />, label: 'Account Information', action: () => {} },
    { icon: <Settings className="w-5 h-5" />, label: 'Preferences', action: () => {} },
    { icon: <Bell className="w-5 h-5" />, label: 'Notifications', action: () => {} },
    { icon: <Shield className="w-5 h-5" />, label: 'Privacy & Security', action: () => {} },
    { icon: <HelpCircle className="w-5 h-5" />, label: 'Help & Support', action: () => {} },
    { icon: <LogOut className="w-5 h-5" />, label: 'Sign Out', action: () => {} },
  ];

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 py-4">
        <h1 className="text-xl font-semibold text-white">Profile</h1>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center space-y-4 py-6"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{user.name.charAt(0)}</span>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white">{user.name}</h2>
            <p className="text-white/50">{user.email}</p>
            <p className="text-white/30 text-sm mt-1">Member since {user.joinDate}</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{user.topicsViewed}</p>
            <p className="text-white/50 text-sm">Topics Viewed</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{user.topicsSaved}</p>
            <p className="text-white/50 text-sm">Topics Saved</p>
          </div>
        </motion.div>

        {/* Menu Items */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-2"
        >
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="text-white/70">{item.icon}</div>
              <span className="text-white">{item.label}</span>
            </button>
          ))}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
} 