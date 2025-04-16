'use client';

import Link from 'next/link'
import { Topic } from '@/types'
import BottomNav from '@/components/BottomNav'
import { Search, MoreVertical } from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import { useRouter } from 'next/navigation'

// This would be replaced with actual data fetching
const mockTopics: Topic[] = [
  {
    id: '1',
    title: 'How do black holes actually work?',
    category: 'Space & Astronomy',
    teaser: 'Discover the mind-bending physics behind these cosmic vacuum cleaners.',
    reels: [],
  },
  {
    id: '2',
    title: 'Why do cats purr?',
    category: 'Animals & Evolution',
    teaser: 'The surprising science behind your feline friend\'s soothing vibrations.',
    reels: [],
  },
  {
    id: '3',
    title: 'How does ChatGPT understand language?',
    category: 'Artificial Intelligence & Computers',
    teaser: 'A simple explanation of the magic behind AI language models.',
    reels: [],
  },
  {
    id: '4',
    title: 'What is déjà vu?',
    category: 'Brain & Memory',
    teaser: 'The strange phenomenon of feeling like you\'ve experienced something before.',
    reels: [],
  },
  {
    id: '5',
    title: 'How do vaccines train your immune system?',
    category: 'Biology & Human Body',
    teaser: 'Understanding how vaccines prepare your body to fight diseases.',
    reels: [],
  },
  {
    id: '6',
    title: 'Why can\'t we breathe underwater?',
    category: 'Biology & Human Body',
    teaser: 'The fascinating reason why humans haven\'t evolved to live underwater.',
    reels: [],
  },
]

export default function FeedPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const currentTopic = mockTopics[currentIndex]

  const goToNext = () => {
    if (currentIndex < mockTopics.length - 1 && !isScrolling) {
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

  const handleWheel = useCallback((e: WheelEvent) => {
    if (Math.abs(e.deltaY) > 5) { // Reduced threshold for more responsive scrolling
      if (e.deltaY > 0) {
        goToNext()
      } else {
        goToPrevious()
      }
    }
  }, [currentIndex, isScrolling])

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const handlers = useSwipeable({
    onSwipedUp: () => goToNext(),
    onSwipedDown: () => goToPrevious(),
    trackMouse: false,
    preventScrollOnSwipe: true,
    swipeDuration: 250, // Reduced from default for faster response
  })

  const handleTopicClick = (e: React.MouseEvent, topicId: string) => {
    e.preventDefault();
    if (Math.abs((e.target as any).offsetY) > 10) {
      return;
    }
    
    setIsTransitioning(true);
    router.push(`/feed/${topicId}`);
  };

  const variants = {
    enter: (direction: number) => ({
      y: direction > 0 ? window.innerHeight : -window.innerHeight,
      opacity: 0,
      x: 0
    }),
    center: {
      y: 0,
      opacity: 1,
      x: 0
    },
    exit: (direction: number) => ({
      y: isTransitioning ? 0 : direction < 0 ? window.innerHeight : -window.innerHeight,
      opacity: isTransitioning ? 1 : 0,
      x: isTransitioning ? -window.innerWidth : 0
    })
  }

  return (
    <motion.div
      key="feed-page"
      initial={{ x: isTransitioning ? 0 : -window.innerWidth }}
      animate={{ x: 0 }}
      exit={{ x: window.innerWidth }}
      transition={{
        x: { type: "tween", duration: 0.2, ease: "easeInOut" }
      }}
      className="fixed inset-0 bg-black"
    >
      {/* Search header */}
      <div className="absolute top-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-b border-white/10 px-3 py-2.5 z-50">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Search topics"
              className="w-full bg-[#222222] rounded-full py-2 pl-10 pr-4 text-[15px] text-white placeholder:text-white/50 focus:outline-none focus:bg-[#333333]"
            />
          </div>
          <button className="p-1.5">
            <MoreVertical className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="h-screen w-full flex items-center justify-center overflow-hidden" {...handlers}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            onAnimationComplete={onAnimationComplete}
            transition={{
              y: { type: "tween", duration: 0.3, ease: "easeInOut" },
              opacity: { duration: 0.15 }
            }}
            className="w-full max-w-lg px-6 absolute"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.7}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.y) * velocity.y;
              if (swipe > 50) goToPrevious();
              if (swipe < -50) goToNext();
            }}
          >
            <div
              className="block cursor-pointer"
              onClick={(e) => handleTopicClick(e, currentTopic.id)}
            >
              <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
                {currentTopic.title}
              </h1>
              <div className="space-y-4">
                <span className="text-lg text-white/50 font-medium block">
                  {currentTopic.category}
                </span>
                <p className="text-lg text-white/90 leading-relaxed font-light">
                  {currentTopic.teaser}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />
    </motion.div>
  );
} 