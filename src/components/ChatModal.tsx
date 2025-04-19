import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send, Paperclip } from 'lucide-react';
import { Topic } from '@/types/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

interface ChatModalProps {
  topic: Topic;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to get a unique key for a topic
const getTopicKey = (topicId: string) => `chat_history_${topicId}`;

export default function ChatModal({ topic, isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousTopicIdRef = useRef<string>(topic.id);
  const { language } = useLanguage();

  // Load cached history when topic changes
  useEffect(() => {
    if (previousTopicIdRef.current !== topic.id) {
      // Save current history before switching topics
      if (previousTopicIdRef.current) {
        const previousKey = getTopicKey(previousTopicIdRef.current);
        localStorage.setItem(previousKey, JSON.stringify(messages));
      }
      
      // Load cached history for the new topic
      const topicKey = getTopicKey(topic.id);
      const cachedHistory = localStorage.getItem(topicKey);
      
      if (cachedHistory) {
        setMessages(JSON.parse(cachedHistory));
      } else {
        setMessages([]);
      }
      
      setInput('');
      previousTopicIdRef.current = topic.id;
    }
  }, [topic.id]);

  // Save history to cache when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const topicKey = getTopicKey(topic.id);
      localStorage.setItem(topicKey, JSON.stringify(messages));
    }
  }, [messages, topic.id]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Start streaming the initial explanation
      streamInitialExplanation();
    }
    
    return () => {
      // Cleanup: abort any ongoing streams when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isOpen, topic]);

  const streamInitialExplanation = async () => {
    // Add initial empty message that will be streamed
    setMessages([{
      role: 'assistant',
      content: '',
      isStreaming: true
    }]);

    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teaser: topic.teaser,
          history: [],
          language
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error('Failed to get response');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        content += chunk;
        
        // Update the message content as we receive chunks
        setMessages([{
          role: 'assistant',
          content,
          isStreaming: true
        }]);
      }

      // Mark streaming as complete
      setMessages([{
        role: 'assistant',
        content,
        isStreaming: false
      }]);

    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      
      console.error('Error streaming explanation:', error);
      setMessages([{ 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while explaining. Please try asking a specific question about the topic.',
        isStreaming: false
      }]);
    }
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teaser: topic.teaser,
          message: userMessage,
          history: messages,
          language
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');
      if (!response.body) throw new Error('No response body');

      // Add empty assistant message that will be streamed
      setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        content += chunk;
        
        // Update the last message with new content
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content, isStreaming: true }
        ]);
      }

      // Mark streaming as complete
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content, isStreaming: false }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.',
          isStreaming: false
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 bg-black z-50 flex flex-col"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            if (offset.x > 50 || velocity.x > 500) {
              onClose();
            }
          }}
        >
          {/* Header */}
          <div className="bg-black/95 backdrop-blur-sm border-b border-white/10">
            <div className="flex items-center gap-3 px-4 py-4">
              <button 
                onClick={onClose}
                className="p-1 -ml-1"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold text-white">
                  Detailed Explanation
                </h1>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-[72px]">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[95%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white/10 text-white rounded-bl-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                  {message.isStreaming && (
                    <span className="inline-block w-1 h-4 ml-1 bg-white/50 animate-pulse" />
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-2xl px-6 py-4 rounded-bl-sm min-w-[120px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="absolute bottom-0 left-0 right-0 bg-black border-t border-white/10">
            <form onSubmit={handleSubmit} className="p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message"
                  className="flex-1 bg-white/10 rounded-full px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2"
                >
                  <Send className={`w-6 h-6 ${input.trim() ? 'text-white' : 'text-white/50'}`} />
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 