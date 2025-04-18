import { useState } from 'react';
import ExplanationDialog from './ExplanationDialog';

interface FactCardProps {
  fact: string;
  onLike: () => void;
  onDislike: () => void;
  language: string;
  isLoading: boolean;
}

export default function FactCard({ fact, onLike, onDislike, language, isLoading }: FactCardProps) {
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  return (
    <>
      <div className="w-full max-w-2xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-800 overflow-hidden transition-all duration-200 hover:shadow-xl hover:shadow-blue-900/20">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed min-h-[100px] sm:min-h-[120px] flex items-center justify-center text-center">
              {fact}
            </div>
            
            <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  onClick={onLike}
                  disabled={isLoading}
                  className={`flex-1 w-full sm:max-w-[200px] px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-base sm:text-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-1 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Like
                </button>
                <button
                  onClick={onDislike}
                  disabled={isLoading}
                  className={`flex-1 w-full sm:max-w-[200px] px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-base sm:text-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-1 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Don't Like
                </button>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={() => setIsExplanationOpen(true)}
                  disabled={isLoading}
                  className={`w-full sm:max-w-[200px] px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-base sm:text-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Explain
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExplanationDialog
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
        fact={fact}
        language={language}
      />
    </>
  );
} 