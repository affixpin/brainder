'use client';

import { Topic } from '@/types/api'
import BottomNav from '@/components/BottomNav'
import { Search, MoreVertical } from 'lucide-react'
import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import ChatModal from '@/components/ChatModal'

const PREFETCH_THRESHOLD = 3; // Start fetching when 3 items away from the end

export default function FeedPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [isFetchingNext, setIsFetchingNext] = useState(false)
  const streamBuffer = useRef('')
  const lastFetchedPage = useRef(0)

  const processStream = async (page: number) => {
    try {
      setIsStreaming(true)
      const response = await fetch(`/api/feed?page=${page}`)
      if (!response.ok) throw new Error('Failed to fetch topics')
      
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      let topicCount = 0;
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        streamBuffer.current += chunk

        // Process complete JSON objects from the buffer
        const lines = streamBuffer.current.split('\n')
        streamBuffer.current = lines.pop() || ''

        for (const line of lines) {
          if (line.trim()) {
            try {
              const topic = JSON.parse(line)
              topicCount++;
              setTopics(prev => {
                const newTopics = [...prev, topic];
                // If this is the first topic, we can stop showing the loading state
                if (newTopics.length === 1) {
                  setIsLoading(false);
                }
                return newTopics;
              });
            } catch (e) {
              console.error('Failed to parse topic:', e)
            }
          }
        }
      }

      // If we received fewer topics than expected, we've reached the end
      if (topicCount < 5) {
        setHasMore(false);
      }

      lastFetchedPage.current = page;
    } catch (err) {
      setError('Failed to load topics. Please try again later.')
      console.error('Error streaming topics:', err)
    } finally {
      setIsStreaming(false)
      setIsFetchingNext(false)
      // Only set isLoading to false if we haven't received any topics yet
      if (topics.length === 0) {
        setIsLoading(false)
      }
    }
  }

  // Initial fetch
  useEffect(() => {
    processStream(1)
  }, [])

  // Check if we need to prefetch more content when the current index changes
  useEffect(() => {
    // Only check for prefetching when the current index changes
    if (hasMore && !isFetchingNext && !isStreaming && topics.length > 0) {
      // If we're approaching the end, fetch the next page
      if (currentIndex >= topics.length - PREFETCH_THRESHOLD) {
        setIsFetchingNext(true);
        processStream(lastFetchedPage.current + 1);
      }
    }
  }, [currentIndex]);

  // Add a new effect to proactively prefetch content
  useEffect(() => {
    // Start prefetching when we have at least one topic loaded
    if (topics.length > 0 && hasMore && !isFetchingNext && !isStreaming) {
      // Calculate how many topics we have left before we need more
      const topicsLeft = topics.length - currentIndex;
      
      // If we're getting close to the end, prefetch more content
      if (topicsLeft <= PREFETCH_THRESHOLD + 2) {
        setIsFetchingNext(true);
        processStream(lastFetchedPage.current + 1);
      }
    }
  }, [topics.length, currentIndex, hasMore, isFetchingNext, isStreaming]);

  useEffect(() => {
    // Set initial window dimensions
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    // Update dimensions on resize
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const goToNext = () => {
    if (currentIndex < topics.length - 1 && !isScrolling) {
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
    if (Math.abs(e.deltaY) > 5) {
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
    swipeDuration: 250,
  })

  const handleTopicClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (Math.abs((e.target as any).offsetY) > 10) {
      return;
    }
    
    setIsChatOpen(true);
  };

  const variants = {
    enter: (direction: number) => ({
      y: direction > 0 ? windowDimensions.height : -windowDimensions.height,
      opacity: 0,
      x: 0
    }),
    center: {
      y: 0,
      opacity: 1,
      x: 0
    },
    exit: (direction: number) => ({
      y: direction < 0 ? windowDimensions.height : -windowDimensions.height,
      opacity: 0,
      x: 0
    })
  }

  const LoadingReel = () => (
    <div className="w-full max-w-lg px-6 space-y-6">
      <div className="h-[72px] bg-white/5 rounded-lg animate-pulse" />
      <div className="space-y-4">
        <div className="h-6 w-24 bg-white/5 rounded-lg animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-full bg-white/5 rounded-lg animate-pulse" />
          <div className="h-6 w-3/4 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-6 w-5/6 bg-white/5 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-white/50">Loading topics...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error || topics.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="space-y-4 text-center px-4">
          <p className="text-white/70">{error || 'No topics available.'}</p>
          <button 
            onClick={() => {
              setIsLoading(true);
              setError(null);
              setTopics([]);
              setHasMore(true);
              lastFetchedPage.current = 0;
              processStream(1);
            }}
            className="px-4 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            Try Again
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const currentTopic = topics[currentIndex];

  return (
    <>
      <motion.div
        key="feed-page"
        initial={{ x: 0 }}
        animate={{ x: 0 }}
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
              {isFetchingNext && currentIndex >= topics.length - PREFETCH_THRESHOLD ? (
                <LoadingReel />
              ) : (
                <div
                  className="block cursor-pointer"
                  onClick={handleTopicClick}
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
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomNav />
      </motion.div>

      <ChatModal
        topic={currentTopic}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
} 