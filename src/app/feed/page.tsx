'use client';

import { Topic } from '@/types/api'
import BottomNav from '@/components/BottomNav'
import { Search, MoreVertical } from 'lucide-react'
import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import ChatModal from '@/components/ChatModal'
import { useLanguage } from '@/contexts/LanguageContext';

const PREFETCH_THRESHOLD = 3; // Start fetching when 3 items away from the end

// Helper function to parse JSON objects from a stream buffer
const parseJsonFromStream = (buffer: string): any[] => {
  const results: any[] = [];
  let startIndex = 0;
  
  while (true) {
    const openBraceIndex = buffer.indexOf('{', startIndex);
    if (openBraceIndex === -1) break;
    
    let braceCount = 1;
    let currentIndex = openBraceIndex + 1;
    
    while (braceCount > 0 && currentIndex < buffer.length) {
      if (buffer[currentIndex] === '{') braceCount++;
      if (buffer[currentIndex] === '}') braceCount--;
      currentIndex++;
    }
    
    if (braceCount === 0) {
      try {
        const jsonStr = buffer.substring(openBraceIndex, currentIndex);
        const obj = JSON.parse(jsonStr);
        results.push(obj);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }
    }
    
    startIndex = currentIndex;
  }
  
  return results;
};

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
  const { language } = useLanguage();

  const processStream = async (page: number) => {
    try {
      setIsStreaming(true);
      const response = await fetch(`/api/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language
        }),
      });
      if (!response.ok) throw new Error('Failed to fetch topics');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value);
        
        // Process complete JSON objects from the buffer
        const jsonObjects = parseJsonFromStream(buffer);
        
        if (jsonObjects.length > 0) {
          // Fix the property name issue - check for both "teaser" and "teteaser"
          const fixedObjects = jsonObjects.map((obj: any) => {
            if (obj.teteaser && !obj.teaser) {
              return {
                ...obj,
                teaser: obj.teteaser,
                teteaser: undefined
              };
            }
            return obj;
          });
          
          setTopics(prev => {
            const newTopics = [...prev, ...fixedObjects];
            // If this is the first topic, we can stop showing the loading state
            if (newTopics.length === 1) {
              setIsLoading(false);
            }
            return newTopics;
          });
          
          // Clear processed objects from buffer
          buffer = buffer.substring(buffer.lastIndexOf('}') + 1);
        }
      }
    } catch (error) {
      console.error('Error processing stream:', error);
      setError('Failed to load topics. Please try again.');
    } finally {
      setIsStreaming(false);
      setIsFetchingNext(false);
      // Only set isLoading to false if we haven't received any topics yet
      if (topics.length === 0) {
        setIsLoading(false);
      }
    }
  };

  // Initial fetch
  useEffect(() => {
    processStream(1);
  }, []);

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
    delta: 10, // Minimum swipe distance required
    touchEventOptions: { passive: false }, // Prevent default touch behavior
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