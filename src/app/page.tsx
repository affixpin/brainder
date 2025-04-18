'use client';

import { useEffect, useState } from 'react';
import FactCard from '@/components/FactCard';

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFact, setCurrentFact] = useState('');

  const generateFact = async (message: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate fact');
      }

      const data = await response.json();
      console.log('Received fact:', data);
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
    generateFact('Generate a different fact');
  };

  useEffect(() => {
    generateFact('Generate a random fact');
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
      <h1 className="text-4xl font-bold mb-8 text-center">Brainder</h1>
      {error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : currentFact ? (
        <FactCard
          fact={currentFact}
          onLike={handleLike}
          onDislike={handleDislike}
        />
      ) : (
        <div className="animate-pulse">Loading your fact... {isLoading ? '(Request in progress)' : '(Waiting to start)'}</div>
      )}
    </main>
  );
}
