'use client';

import { Topic } from '@/types/api'
import BottomNav from '@/components/BottomNav'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext';
import Feed from '@/components/Feed';
import { cleanStoredReels, getStoredReels, setStoredReels } from '@/utils/reelsUtils';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';

const LEARNING_PLAN_STORAGE_KEY = 'brainder_learning_plan';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const learningPlan = localStorage.getItem(LEARNING_PLAN_STORAGE_KEY);
    if (learningPlan) {
      setLearningPlan(learningPlan);
      setShowFeed(true);
    }
  }, []);

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

      if (!response.ok) throw new Error('Failed to fetch topics');

      const data = await response.json();
      setLearningPlan(data.learningPlan);
      setShowFeed(true);
      localStorage.setItem(LEARNING_PLAN_STORAGE_KEY, data.learningPlan);
    } catch (error) {
      console.error('Error getting learning plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px'; // match min-height
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      setUserMessage(input.trim());
      getLearningPlan(input.trim());
      setInput('');
      resetTextareaHeight();
    }
  };

  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = '44px'; // Reset height first
    target.style.height = `${target.scrollHeight}px`;
  };

  const fetchMoreContent = useCallback(async (): Promise<Topic> => {
    const response = await fetch('/api/learn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        history: history.map(topic => topic.title),
        learningPlan,
        level: 0
      }),
    });

    if (!response.ok) throw new Error('Failed to fetch topics');

    const newTopic = await response.json();
    setStoredReels('brainder_learn_history', [...history, newTopic]);
    setHistory(prev => [...prev, newTopic]);
    return newTopic;
  }, [language, history, learningPlan]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [userMessage]);

  const cleanData = () => {
    localStorage.removeItem(LEARNING_PLAN_STORAGE_KEY);
    cleanStoredReels('brainder_learn_history');
    setLearningPlan('');
    setHistory([]);
    setUserMessage(null);
    setShowFeed(false);
  }

  return (
    <motion.div
      key="learn-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black"
    >
      {/* Header */}
      <div className="bg-black/95 backdrop-blur-sm border-b border-white/10 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Learn</h1>
          {showFeed && (
            <button
              onClick={cleanData}
              className="px-4 py-1.5 text-sm font-medium text-white bg-white/10 rounded-full hover:bg-white/20 transition-all"
              aria-label="Start new learning plan"
            >
              New
            </button>
          )}
        </div>
      </div>

      {!showFeed ? (
        <div className="flex flex-col h-[calc(100vh-72px)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-[80px]">
            <div className="flex justify-start">
              <div className="max-w-[95%] rounded-2xl px-4 py-2 bg-white/10 text-white rounded-bl-sm">
                <div className="whitespace-pre-wrap break-words">
                  <p className="text-white/90 text-lg">Before we get started, please answer a few questions:</p>
                  <br/>
                  <div className="space-y-2">
                    <p>1. What skill would you like to learn?</p>
                    <p>2. Why do you want to learn it? (your goal)</p>
                    <p>3. Do you have any prior experience with this skill?</p>
                    <p>4. How much time can you spend on it daily or weekly?</p>
                    <p>5. How fast do you want to reach your goal? <span className="text-white/70">(e.g., "I want to get a job in 3 months")</span></p>
                  </div>
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
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your answer..."
                  disabled={isLoading}
                  rows={1}
                  className="flex-1 bg-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 disabled:opacity-50 resize-none min-h-[44px] max-h-[160px] leading-[1.4]"
                  style={{ 
                    height: '44px',
                    overflow: 'hidden'
                  }}
                  onInput={handleTextareaInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="p-2 h-[44px] flex items-center justify-center disabled:opacity-50"
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
        <div className="h-[calc(100vh-128px)] flex items-center">
          <Feed onLoadMore={fetchMoreContent} key={feedKey} />
        </div>
      )}

      <BottomNav />
    </motion.div>
  );
} 