'use client';

import { Topic } from '@/types/api'
import BottomNav from '@/components/BottomNav'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext';
import Feed from '@/components/Feed';
import { getStoredReels, setStoredReels } from '@/utils/reelsUtils';
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function FeedPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [feedKey, setFeedKey] = useState(0);
  const [history, setHistory] = useState<Topic[]>(() => {
    if (typeof window !== 'undefined') {
      return getStoredReels('brainder_discover_history');
    }
    return [];
  });

  const fetchMoreContent = async (): Promise<Topic> => {
    const response = await fetch('/api/feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        history: history.map(topic => topic.title),
        search: searchQuery
      }),
    });

    if (!response.ok) throw new Error('Failed to fetch topics');

    const newTopic = await response.json();

    setStoredReels('brainder_discover_history', [...history, newTopic]);
    setHistory(prev => [...prev, newTopic]);
    return newTopic;
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedKey(prev => prev + 1);
  };

  return (
    <motion.div
      key="feed-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black"
    >
      {/* Search header */}
      <div className="absolute top-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-b border-white/10 px-3 py-2.5 z-50">
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-lg mx-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics"
              className="w-full bg-[#222222] rounded-full py-2 pl-10 pr-4 text-[15px] text-white placeholder:text-white/50 focus:outline-none focus:bg-[#333333]"
            />
          </div>
          <button
            type="submit"
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>

      <Feed onLoadMore={fetchMoreContent} key={feedKey} />
      <BottomNav />
    </motion.div>
  );
}