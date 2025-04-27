'use client';

import { Topic } from '@/types/api'
import BottomNav from '@/components/BottomNav'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext';
import Feed from '@/components/Feed';
import { getStoredReels, setStoredReels } from '@/utils/reelsUtils';
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function LearnPage() {
  const [history, setHistory] = useState<Topic[]>(() => {
    if (typeof window !== 'undefined') {
      return getStoredReels('brainder_learn_history');
    }
    return [];
  });
  const { language } = useLanguage();
  const [feedKey, setFeedKey] = useState(0);
  const [learningPlan, setLearningPlan] = useState('');
  const [showFeed, setShowFeed] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getLearningPlan = async (answer: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLearningPlan(data.learningPlan);
        setShowFeed(true);
      }
    } catch (error) {
      console.error('Error getting learning plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      setUserMessage(input.trim());
      getLearningPlan(input.trim());
    }
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

    setStoredReels('brainder_learn_history', [...history, newTopic]);
    setHistory(prev => [...prev, newTopic]);
    return newTopic;
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [userMessage]);

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

      {!showFeed ? (
        <div className="flex flex-col h-[calc(100vh-72px)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-[80px]">
            <div className="flex justify-start">
              <div className="max-w-[95%] rounded-2xl px-4 py-2 bg-white/10 text-white rounded-bl-sm">
                <div className="whitespace-pre-wrap break-words">
                  What would you like to learn about?
                </div>
              </div>
            </div>

            {userMessage && (
              <div className="flex justify-end">
                <div className="max-w-[95%] rounded-2xl px-4 py-2 bg-blue-600 text-white rounded-br-sm">
                  <div className="whitespace-pre-wrap break-words">
                    {userMessage}
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[95%] rounded-2xl px-4 py-2 bg-white/10 text-white rounded-bl-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating learning plan for you...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="fixed bottom-[72px] left-0 right-0 bg-black border-t border-white/10">
            <form onSubmit={handleSubmit} className="p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your answer..."
                  disabled={isLoading}
                  className="flex-1 bg-white/10 rounded-full px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="p-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Send className={`w-6 h-6 ${input.trim() ? 'text-white' : 'text-white/50'}`} />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <Feed onLoadMore={fetchMoreContent} key={feedKey} />
      )}
      
      <BottomNav />
    </motion.div>
  );
} 