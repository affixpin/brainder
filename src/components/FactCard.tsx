import { useState } from 'react';

interface FactCardProps {
  fact: string;
  onLike: () => void;
  onDislike: () => void;
}

export default function FactCard({ fact, onLike, onDislike }: FactCardProps) {
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl m-4 p-6">
      <div className="p-8">
        <div className="text-xl font-semibold text-gray-900 mb-8">
          {fact}
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onLike}
            className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          >
            Like
          </button>
          <button
            onClick={onDislike}
            className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            Don't Like
          </button>
        </div>
      </div>
    </div>
  );
} 