'use client';

import { useEffect, useState, useRef } from 'react';
import FactCard from '@/components/FactCard';
import Layout from '@/components/Layout';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const LANGUAGES = ['Українська', 'English', 'Русский'];

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [currentFact, setCurrentFact] = useState('');
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  const [language, setLanguage] = useState('Українська');
  const [isLoading, setIsLoading] = useState(false);
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
          language: selectedLanguage
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

  const handleLanguageChange = async (newLanguage: string) => {
    if (newLanguage === language || isLoading) return;
    setLanguage(newLanguage);
    setMessageHistory([]);
    generateFact('Generate an interesting science fact', newLanguage);
  };

  useEffect(() => {
    if (!initialRequestMade.current) {
      initialRequestMade.current = true;
      generateFact('Generate an interesting science fact', 'Українська');
    }
  }, []);

  return (
    <Layout>
      <div className="min-h-screen py-4 sm:py-8 md:py-12">
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
          
          <div className="mt-4 sm:mt-8">
            {error ? (
              <div className="text-red-400 text-center">{error}</div>
            ) : (
              <FactCard
                fact={currentFact}
                onLike={handleLike}
                onDislike={handleDislike}
                language={language}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
