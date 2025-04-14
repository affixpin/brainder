'use client';

import Link from 'next/link'
import { Topic } from '@/types'
import BottomNav from '@/components/BottomNav'
import { Search, MoreVertical } from 'lucide-react'
import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const currentTopic = mockTopics[currentIndex]

  const goToNext = () => {
    if (currentIndex < mockTopics.length - 1) {
      setDirection(1)
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handlers = useSwipeable({
    onSwipedLeft: () => goToNext(),
    onSwipedRight: () => goToPrevious(),
    trackMouse: true,
    preventScrollOnSwipe: true,
  })

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
    }),
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Search header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-sm border-b border-white/10 px-3 py-2.5 z-50">
        <div className="flex items-center gap-2 max-w-xl mx-auto">
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

      {/* Full screen card */}
      <div className="flex-1 flex items-center justify-center overflow-hidden py-4">
        <div className="relative w-full h-[calc(100vh-9.5rem)]" {...handlers}>
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 },
              }}
              className="absolute inset-0 px-3"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -100) goToNext();
                if (swipe > 100) goToPrevious();
              }}
            >
              <Link
                href={`/feed/${currentTopic.id}`}
                className="block bg-[#222222] rounded-3xl h-full mx-auto max-w-xl flex flex-col justify-center text-center"
              >
                <div className="px-6 py-16 md:px-8">
                  <span className="text-sm text-white/50 font-medium block mb-8">
                    {currentTopic.category}
                  </span>
                  <h3 className="text-[2.5rem] md:text-5xl font-bold text-white leading-tight mb-8">
                    {currentTopic.title}
                  </h3>
                  <p className="text-lg text-white/70 leading-relaxed max-w-md mx-auto">
                    {currentTopic.teaser}
                  </p>
                </div>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <BottomNav />
    </div>
  );
} 