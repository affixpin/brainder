'use client';

import { Topic } from '@/types/api'
import BottomNav from '@/components/BottomNav'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext';
import Feed from '@/components/Feed';
import { getStoredReels, setStoredReels } from '@/utils/reelsUtils';
import { useState } from 'react';

export default function LearnPage() {
  const [history, setHistory] = useState<Topic[]>(() => {
    if (typeof window !== 'undefined') {
      return getStoredReels('brainder_discover_history');
    }
    return [];
  });
  const { language } = useLanguage();
  const [feedKey, setFeedKey] = useState(0);
  const [learningPlan, setLearningPlan] = useState('');

  const getLearningPlan = async (): Promise<void> => {
    const response = await fetch('/api/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answer: '1) Javascript. 2) To become senior developer. 3) No. 4) 30 mins per day. 5) 6 months'
      }),
    });
  };

  const fetchMoreContent = async (): Promise<Topic> => {
    const response = await fetch('/api/learn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        history: history.map(topic => topic.title),
        learningPlan,
        level: 0 // TODO
      }),
    });

    if (!response.ok) throw new Error('Failed to fetch topics');

    const newTopic = await response.json();

    setStoredReels('brainder_discover_history', [...history, newTopic]);
    setHistory(prev => [...prev, newTopic]);
    return newTopic;
  };

  return (
    <motion.div
      key="learn-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black"
    >
      {/* Header */}
      <div className="bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 py-4">
        <h1 className="text-xl font-semibold text-white">Learn</h1>
      </div>

      <Feed onLoadMore={fetchMoreContent} key={feedKey} />
      <BottomNav />
    </motion.div>
  );
} 