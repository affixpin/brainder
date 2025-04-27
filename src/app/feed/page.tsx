'use client';

import { Topic } from '@/types/api'
import BottomNav from '@/components/BottomNav'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext';
import Feed from '@/components/Feed';
import { getStoredReels, setStoredReels } from '@/utils/reelsUtils';
import { useState } from 'react';

export default function FeedPage() {
  const [history, setHistory] = useState<Topic[]>(() => {
    if (typeof window !== 'undefined') {
      return getStoredReels('brainder_discover_history');
    }
    return [];
  });
  const { language } = useLanguage();

  const fetchMoreContent = async (searchQuery: string): Promise<Topic> => {
    const response = await fetch('/api/feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        existingTopics: history.map(topic => topic.title),
        search: searchQuery
      }),
    });

    if (!response.ok) throw new Error('Failed to fetch topics');

    const newTopic = await response.json();

    setStoredReels('brainder_discover_history', [...history, newTopic]);
    setHistory(prev => [...prev, newTopic]);
    return newTopic;
  };

  return (
    <>
      <motion.div
        key="feed-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black"
      >
        <Feed onLoadMore={fetchMoreContent} />
        <BottomNav />
      </motion.div>
    </>
  );
}