'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';

interface QuestionBlockProps {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function QuestionBlock({
  question,
  options,
  correctAnswer,
  explanation,
}: QuestionBlockProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
  };

  return (
    <div className="relative h-screen w-full bg-black flex items-center justify-center">
      {/* Main content */}
      <div className="w-full max-w-lg px-6">
        <h2 className="text-3xl font-bold text-white mb-8 leading-tight">
          {question}
        </h2>
        <div className="space-y-4">
          {options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === correctAnswer;
            const showResult = isSelected && showExplanation;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
                className={`
                  w-full p-5 rounded-xl text-left transition-all flex items-center justify-between
                  ${showResult
                    ? isCorrect
                      ? 'bg-green-500/20 border-2 border-green-500'
                      : 'bg-red-500/20 border-2 border-red-500'
                    : 'bg-white/10 hover:bg-white/20 border-2 border-transparent'
                  }
                `}
              >
                <span className="text-lg text-white font-medium pr-4">{option}</span>
                {showResult && (
                  <div className={`shrink-0 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {isCorrect ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {showExplanation && (
          <div className="mt-8 p-6 rounded-xl bg-white/10 border border-white/20">
            <p className="text-lg text-white/90 leading-relaxed">
              {selectedAnswer === correctAnswer ? (
                <span className="text-green-500 font-semibold block mb-2">Correct! </span>
              ) : (
                <span className="text-red-500 font-semibold block mb-2">Not quite. </span>
              )}
              {explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 