'use client';

import { Topic } from '@/types'
import TextBlock from '@/components/TextBlock'
import QuestionBlock from '@/components/QuestionBlock'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

// This would be replaced with actual data fetching
const mockTopic: Topic = {
  id: '1',
  title: 'How do black holes actually work?',
  category: 'Space & Astronomy',
  teaser: 'Discover the mind-bending physics behind these cosmic vacuum cleaners.',
  reels: [
    {
      type: 'text',
      content: 'If black holes suck in everything, how do we even know they exist?\n\nThe answer lies in the incredible ways they affect space, time, and light around them. Let me show you how we discovered these cosmic monsters...'
    },
    {
      type: 'text',
      content: 'First, imagine space as a stretched rubber sheet. When you place a heavy ball on it, it creates a dip.\n\nA black hole is like an infinitely heavy ball that creates such a deep dip that nothing can climb back out – not even light!'
    },
    {
      type: 'text',
      content: 'We can\'t see black holes directly (they\'re black, after all!), but we can spot them by watching how they affect their surroundings:\n\n1. They bend light from stars behind them\n2. They make nearby stars orbit around seemingly nothing\n3. They create powerful jets of radiation when eating stars'
    },
    {
      type: 'question',
      question: 'What\'s the main way we detect black holes?',
      options: [
        'By taking photos of them',
        'By observing how they affect nearby objects',
        'By sending probes into them',
        'By measuring their temperature'
      ],
      correctAnswer: 1,
      explanation: 'We mainly detect black holes by observing how they affect nearby stars and gas. When objects orbit around an invisible point in space, that\'s a big clue!'
    }
  ]
}

export default function TopicPage({ params }: { params: { topicId: string } }) {
  return (
    <>
      {/* Back button */}
      <Link 
        href="/feed"
        className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </Link>

      <main className="snap-y snap-mandatory h-screen w-full overflow-y-scroll pb-16">
        {mockTopic.reels.map((reel, index) => (
          <div key={index} className="snap-start snap-always h-screen w-full">
            {reel.type === 'text' ? (
              <TextBlock content={reel.content} />
            ) : (
              <QuestionBlock
                question={reel.question}
                options={reel.options}
                correctAnswer={reel.correctAnswer}
                explanation={reel.explanation}
              />
            )}
          </div>
        ))}
      </main>

      <BottomNav />
    </>
  )
} 