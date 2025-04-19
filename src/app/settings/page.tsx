'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Shield, HelpCircle } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { languages } from '@/data/languages';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { language, setLanguage } = useLanguage();
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setIsLanguageModalOpen(false);
  };

  const settingsSections: SettingSection[] = [
    {
      title: 'Preferences',
      items: [
        { 
          icon: <Globe className="w-5 h-5" />, 
          label: 'Language', 
          action: () => setIsLanguageModalOpen(true),
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