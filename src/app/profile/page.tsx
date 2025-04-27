'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Globe, Bell, Shield, HelpCircle, LogOut } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { languages } from '@/data/languages';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  // Mock user data - in a real app, this would come from an API or context
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinDate: 'January 2023',
    topicsViewed: 42,
    topicsSaved: 7
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setIsLanguageModalOpen(false);
  };

  const menuItems = [
    { icon: <User className="w-5 h-5" />, label: 'Account Information', action: () => {} },
    { icon: <Globe className="w-5 h-5" />, label: 'Language', action: () => setIsLanguageModalOpen(true), value: language },
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
              className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-white/70">{item.icon}</div>
                <span className="text-white">{item.label}</span>
              </div>
              {item.value && <span className="text-white/50">{item.value}</span>}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Language Selection Modal */}
      {isLanguageModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setIsLanguageModalOpen(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-black border border-white/10 rounded-xl w-full max-w-md mx-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Select Language</h2>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`w-full p-4 text-left flex items-center justify-between ${
                    language === lang ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-white">{lang}</span>
                  {language === lang && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
} 