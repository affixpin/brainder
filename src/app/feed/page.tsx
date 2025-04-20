'use client';

import { Topic } from '@/types/api'
import BottomNav from '@/components/BottomNav'
import { Search, MoreVertical } from 'lucide-react'
import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import ChatModal from '@/components/ChatModal'
import { useLanguage } from '@/contexts/LanguageContext';

export default function FeedPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const { language } = useLanguage();
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const SWIPE_THRESHOLD = 0.05; // Lower threshold from 0.08 to 0.05 - just 5% of screen height
  const VELOCITY_THRESHOLD = 0.1; // More sensitive velocity detection (from 0.15 to 0.1)

  console.log("currentIndex", currentIndex)

  // Calculate a more responsive non-linear drag position with less resistance
  const calculateDragWithResistance = (delta: number): number => {
    const maxDrag = windowDimensions.height;
    const sign = Math.sign(delta);
    const absValue = Math.min(Math.abs(delta), maxDrag);

    // More responsive at the beginning, with even less resistance
    // Starts at 95% response, goes down to 60% at maximum drag
    const resistance = 0.95 - 0.35 * Math.pow(absValue / maxDrag, 1.25);

    // Amplify small movements more - multiply small drags by up to 1.8x
    const amplifier = 1 + (0.8 * Math.max(0, 1 - absValue / (maxDrag * 0.25)));

    return sign * (absValue * resistance * amplifier);
  };

  // Simplified fetch content function with better error handling
  const fetchMoreContent = async () => {
    // Prevent duplicate requests while one is in progress

    try {
      setIsFetchingMore(true);

      const response = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });

      if (!response.ok) throw new Error('Failed to fetch topics');

      const data = await response.json();
      // Process topics if API returns formatted array directly
      setTopics(prev => [...prev, ...data]);
      // Update last fetched page and loading states
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Failed to load topics. Please try again.');
    } finally {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    if (isFetchingMore) {
      return
    }

    if (topics.length === 0) {
      fetchMoreContent();
      console.log("fetching more content initial")
    }

    if (currentIndex >= topics.length - 1 && topics.length > 0) {
      console.log("fetching more content", currentIndex, topics.length)
      fetchMoreContent();
    }
  }, [currentIndex, topics.length]);

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
    setIsScrolling(true);
    setDirection(1);
    setCurrentIndex(currentIndex + 1);
  };

  const goToPrevious = () => {
    setIsScrolling(true);
    setDirection(-1);
    setCurrentIndex(currentIndex - 1);
  };

  const onAnimationComplete = () => {
    setIsScrolling(false)
  }

  const handleWheel = useCallback((e: WheelEvent) => {
    // More sensitive wheel handling
    if (!isDragging && Math.abs(e.deltaY) > 1) { // Lower threshold from 3 to 1 for higher sensitivity
      if (e.deltaY > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
  }, [currentIndex, isScrolling, isDragging]);

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const handlers = useSwipeable({
    onSwipedUp: (e) => {
      const threshold = windowDimensions.height * SWIPE_THRESHOLD;
      const velocity = Math.abs(e.velocity);

      if (Math.abs(e.deltaY) > threshold || velocity > VELOCITY_THRESHOLD) {
        goToNext();
      }
      setIsDragging(false);
      setDragY(0);
    },
    onSwipedDown: (e) => {
      const threshold = windowDimensions.height * SWIPE_THRESHOLD;
      const velocity = Math.abs(e.velocity);

      if (Math.abs(e.deltaY) > threshold || velocity > VELOCITY_THRESHOLD) {
        goToPrevious();
      }
      setIsDragging(false);
      setDragY(0);
    },
    onSwiping: (e) => {
      setIsDragging(true);
      // Apply improved responsive resistance curve
      const resistantDrag = calculateDragWithResistance(e.deltaY);
      setDragY(resistantDrag);
    },
    onTouchEndOrOnMouseUp: () => {
      // If we're still dragging when touch ends, check if we should complete the transition
      if (isDragging) {
        const threshold = windowDimensions.height * SWIPE_THRESHOLD;
        if (Math.abs(dragY) > threshold) {
          if (dragY > 0) {
            goToPrevious();
          } else {
            goToNext();
          }
        }
        setIsDragging(false);
        setDragY(0);
      }
    },
    trackMouse: true, // Also track mouse movements for desktop
    preventScrollOnSwipe: true,
    swipeDuration: 200, // Reduced from 250 to 200 for snappier response
    delta: 2, // Lower delta for much higher sensitivity (was 5)
    touchEventOptions: { passive: false },
  });

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
      rotate: direction > 0 ? 2 : -2,
      opacity: 0,
      scale: 0.92,
    }),
    center: {
      y: isDragging ? dragY : 0,
      rotate: isDragging ? dragY * 0.03 : 0, // Increased rotation effect for more visual feedback
      opacity: isDragging
        ? 1 - Math.min(0.2, Math.abs(dragY) / windowDimensions.height)
        : 1,
      scale: isDragging
        ? 1 - Math.min(0.08, Math.abs(dragY) / windowDimensions.height * 0.15)
        : 1,
      transition: {
        y: {
          type: "tween", // Changed from spring to tween for no bounce
          duration: 0.3, // Smooth transition duration
          ease: "easeOut" // Ease out for smooth stop
        },
        rotate: {
          type: "tween", // Changed from spring to tween
          duration: 0.3,
          ease: "easeOut"
        },
        opacity: { duration: 0.08 },
        scale: { duration: 0.08 },
      }
    },
    exit: (direction: number) => ({
      y: direction < 0 ? windowDimensions.height : -windowDimensions.height,
      rotate: direction < 0 ? 2 : -2,
      opacity: 0,
      scale: 0.92,
      transition: {
        y: {
          type: "tween", // Changed from spring to tween for no bounce
          duration: 0.4, // Slightly longer duration for exit
          ease: "easeIn" // Ease in for smooth start
        },
        rotate: { duration: 0.2 },
        opacity: { duration: 0.12 },
        scale: { duration: 0.12 },
      }
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


  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="space-y-4 text-center px-4">
          <p className="text-white/70">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setTopics([]);
              setHasMore(true);
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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
        <main
          className="h-screen w-full flex items-center justify-center overflow-hidden"
          {...handlers}
          style={{ touchAction: 'none' }}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              onAnimationComplete={onAnimationComplete}
              className={`w-full max-w-lg px-6 absolute ${isDragging ? 'touch-none' : ''}`}
            >
              {!currentTopic ? (
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