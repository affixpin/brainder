'use client';

import { useEffect, useState } from 'react';
import FactCard from '@/components/FactCard';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Language = 'en' | 'es' | 'fr';

const LANGUAGES = {
  en: 'English',
  es: 'Español',
  fr: 'Français'
};

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFact, setCurrentFact] = useState('');
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  const [language, setLanguage] = useState<Language>('en');

  const generateFact = async (message: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message to history
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
          language
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate fact');
      }

      const data = await response.json();
      console.log('Received fact:', data);
      
      // Add assistant response to history
      const assistantMessage: Message = { role: 'assistant', content: data.content };
      setMessageHistory([...updatedHistory, assistantMessage]);
      setCurrentFact(data.content);
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

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setMessageHistory([]); // Clear message history when language changes
    generateFact('Generate an interesting science fact');
  };

  // Generate initial fact on mount
  useEffect(() => {
    generateFact('Generate an interesting science fact');
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="absolute top-4 right-4 flex gap-2">
        {(Object.entries(LANGUAGES) as [Language, string][]).map(([code, name]) => (
          <button
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={`px-4 py-2 rounded-md transition-colors ${
              language === code
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      
      {error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : (
        <FactCard
          fact={currentFact}
          onLike={handleLike}
          onDislike={handleDislike}
          isLoading={isLoading}
        />
      )}
    </main>
  );
}
