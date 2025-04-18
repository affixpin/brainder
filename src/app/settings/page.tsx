'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Bell, Globe, Shield, HelpCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

type SettingItem = {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  value?: string;
  toggle: boolean;
};

type SettingSection = {
  title: string;
  items: SettingItem[];
};

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');

  const settingsSections: SettingSection[] = [
    {
      title: 'Appearance',
      items: [
        { 
          icon: <Moon className="w-5 h-5" />, 
          label: 'Dark Mode', 
          action: () => setDarkMode(!darkMode),
          value: darkMode ? 'On' : 'Off',
          toggle: true
        },
      ]
    },
    {
      title: 'Notifications',
      items: [
        { 
          icon: <Bell className="w-5 h-5" />, 
          label: 'Push Notifications', 
          action: () => setNotifications(!notifications),
          value: notifications ? 'On' : 'Off',
          toggle: true
        },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: <Globe className="w-5 h-5" />, 
          label: 'Language', 
          action: () => {},
          value: language,
          toggle: false
        },
      ]
    },
    {
      title: 'About',
      items: [
        { 
          icon: <Shield className="w-5 h-5" />, 
          label: 'Privacy Policy', 
          action: () => {},
          toggle: false
        },
        { 
          icon: <HelpCircle className="w-5 h-5" />, 
          label: 'Terms of Service', 
          action: () => {},
          toggle: false
        },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 py-4">
        <h1 className="text-xl font-semibold text-white">Settings</h1>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div 
            key={sectionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: sectionIndex * 0.1 }}
            className="p-4"
          >
            <h2 className="text-sm font-medium text-white/50 mb-2">{section.title}</h2>
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-white/70">{item.icon}</div>
                    <span className="text-white">{item.label}</span>
                  </div>
                  {item.toggle ? (
                    <div className={`w-10 h-6 rounded-full transition-colors ${item.value === 'On' ? 'bg-blue-500' : 'bg-white/20'}`}>
                      <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${item.value === 'On' ? 'translate-x-4' : 'translate-x-0.5'} translate-y-0.5`} />
                    </div>
                  ) : (
                    <span className="text-white/50">{item.value}</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
} 