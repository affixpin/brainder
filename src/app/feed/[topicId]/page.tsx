'use client';

import { Topic } from '@/types'
import TextBlock from '@/components/TextBlock'
import QuestionBlock from '@/components/QuestionBlock'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import { useRouter } from 'next/navigation'

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
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    setIsExiting(false)
  }, [])

  const goToNext = () => {
    if (currentIndex < mockTopic.reels.length - 1 && !isScrolling) {
      setIsScrolling(true)
      setDirection(1)
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0 && !isScrolling) {
      setIsScrolling(true)
      setDirection(-1)
      setCurrentIndex(currentIndex - 1)
    }
  }

  const onAnimationComplete = () => {
    setIsScrolling(false)
  }

  const handlers = useSwipeable({
    onSwipedUp: () => goToNext(),
    onSwipedDown: () => goToPrevious(),
    trackMouse: false,
    preventScrollOnSwipe: true,
    swipeDuration: 250,
  })

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 5) {
        if (e.deltaY > 0) {
          goToNext()
        } else {
          goToPrevious()
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [currentIndex, isScrolling])

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    router.push('/feed');
  };

  const contentVariants = {
    enter: (direction: number) => ({
      y: direction > 0 ? window.innerHeight : -window.innerHeight,
      opacity: 0
    }),
    center: {
      y: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      y: direction < 0 ? window.innerHeight : -window.innerHeight,
      opacity: 0
    })
  }

  return (
    <motion.div
      key="topic-page"
      initial={{ x: window.innerWidth }}
      animate={{ x: 0 }}
      exit={{ x: -window.innerWidth }}
      transition={{
        x: { type: "tween", duration: 0.2, ease: "easeInOut" }
      }}
      className="fixed inset-0 bg-black"
    >
      {/* Back button */}
      <button 
        onClick={handleBackClick}
        className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <main 
        className="h-screen w-full overflow-hidden" 
        {...handlers}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            onAnimationComplete={onAnimationComplete}
            transition={{
              y: { type: "tween", duration: 0.3, ease: "easeInOut" },
              opacity: { duration: 0.15 }
            }}
            className="absolute inset-0 w-full h-full"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.7}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.y) * velocity.y;
              if (swipe > 50) goToPrevious();
              if (swipe < -50) goToNext();
            }}
          >
            {mockTopic.reels[currentIndex].type === 'text' ? (
              <TextBlock content={mockTopic.reels[currentIndex].content} />
            ) : (
              <QuestionBlock
                question={mockTopic.reels[currentIndex].question}
                options={mockTopic.reels[currentIndex].options}
                correctAnswer={mockTopic.reels[currentIndex].correctAnswer}
                explanation={mockTopic.reels[currentIndex].explanation}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />
    </motion.div>
  )
} 