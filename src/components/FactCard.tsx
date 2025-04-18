import { useState } from 'react';
import ExplanationDialog from './ExplanationDialog';

interface FactCardProps {
  fact: string;
  onLike: () => void;
  onDislike: () => void;
  isLoading?: boolean;
}

export default function FactCard({ fact, onLike, onDislike, isLoading = false }: FactCardProps) {
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  return (
    <>
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl m-4 p-6">
        <div className="p-8">
          <div className="text-xl font-semibold text-gray-900 mb-8 min-h-[100px] flex items-center justify-center">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              fact
            )}
          </div>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-center space-x-4">
              <button
                onClick={onLike}
                disabled={isLoading}
                className={`px-6 py-2 bg-green-500 text-white rounded-full transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
                }`}
              >
                Like
              </button>
              <button
                onClick={onDislike}
                disabled={isLoading}
                className={`px-6 py-2 bg-red-500 text-white rounded-full transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'
                }`}
              >
                Don't Like
              </button>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setIsExplanationOpen(true)}
                disabled={isLoading}
                className={`px-6 py-2 bg-blue-500 text-white rounded-full transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                }`}
              >
                Explain in Detail
              </button>
            </div>
          </div>
        </div>
      </div>

      <ExplanationDialog
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
        fact={fact}
      />
    </>
  );
} 