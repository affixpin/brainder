'use client';

import { useEffect, useState, useRef } from 'react';
import FactCard from '@/components/FactCard';
import Layout from '@/components/Layout';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const LANGUAGES = ['Українська', 'English', 'Русский'];
const QUICK_INTERESTS = [
  'Space',
  'Biology',
  'Physics',
  'Psychology',
  'Neuroscience',
  'Astronomy',
  'Climate',
  'Dinosaurs',
  'Human Body',
  'Technology',
  'IT',
  'Mathematics',
  'Medicine',
  'AI',
  'Animals'
];

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [currentFact, setCurrentFact] = useState('');
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  const [language, setLanguage] = useState('Українська');
  const [isLoading, setIsLoading] = useState(false);
  const [interest, setInterest] = useState('');
  const [tempInterest, setTempInterest] = useState('');
  const [isInterestModified, setIsInterestModified] = useState(false);
  const initialRequestMade = useRef(false);

  const generateFact = async (message: string, selectedLanguage = language) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const newUserMessage: Message = { role: 'user', content: message };
      const updatedHistory = [...messageHistory, newUserMessage];
      setMessageHistory(updatedHistory);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedHistory,
          language: selectedLanguage,
          interest: interest
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate fact');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let streamedContent = '';
      setCurrentFact('');
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        const chunk = decoder.decode(value);
        streamedContent += chunk;
        setCurrentFact(streamedContent);
      }
      
      const assistantMessage: Message = { role: 'assistant', content: streamedContent };
      setMessageHistory([...updatedHistory, assistantMessage]);
    } catch (err) {
      console.error('Error generating fact:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate fact');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = () => {
    generateFact('Like this fact');
  };

  const handleDislike = () => {
    generateFact('I DO NOT like this fact');
  };

  const handleInterestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempInterest(e.target.value);
    setIsInterestModified(true);
  };

  const handleSetInterest = () => {
    setInterest(tempInterest);
    setIsInterestModified(false);
    if (tempInterest) {
      generateFact(`Generate an interesting science fact about ${tempInterest}`);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    if (newLanguage === language || isLoading) return;
    setLanguage(newLanguage);
    setMessageHistory([]);
    const message = interest 
      ? `Generate an interesting science fact about ${interest}`
      : 'Generate an interesting science fact';
    generateFact(message, newLanguage);
  };

  const handleQuickInterest = (interest: string) => {
    setTempInterest(interest);
    setIsInterestModified(true);
  };

  useEffect(() => {
    if (!initialRequestMade.current) {
      initialRequestMade.current = true;
      generateFact('Generate an interesting science fact', 'Українська');
    }
  }, []);

  return (
    <Layout>
      <div className="py-4 sm:py-8 md:py-12">
        <div className="max-w-2xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              Brainder
            </h1>
            <p className="mt-2 text-base sm:text-lg text-gray-400">
              TikTok for your brain
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4 sm:mt-8">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  disabled={isLoading}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    language === lang
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-8 sm:mt-8">
            {error ? (
              <div className="text-red-400 text-center">{error}</div>
            ) : (
              <div className="w-full max-w-2xl mx-auto">
                <FactCard
                  fact={currentFact}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  language={language}
                  isLoading={isLoading}
                />
                <div className="mt-8 px-2 sm:px-6 lg:px-8">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={tempInterest}
                      onChange={handleInterestChange}
                      placeholder="Enter your interest (e.g., space, biology)"
                      className="w-full px-3 sm:px-4 py-2.5 text-sm sm:text-base rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 placeholder:text-sm placeholder:text-gray-500"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSetInterest}
                      disabled={!isInterestModified || isLoading}
                      className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 ${
                        isInterestModified && !isLoading
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:opacity-90'
                          : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Set
                    </button>
                  </div>
                  <div className="mt-8 flex flex-wrap justify-center gap-2 w-fit mx-auto">
                    {QUICK_INTERESTS.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => handleQuickInterest(interest)}
                        className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 
                          ${isLoading 
                            ? 'bg-gray-800 text-gray-300 opacity-75' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700 hover:border-gray-600'
                          }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
