import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send } from 'lucide-react';
import { Topic } from '@/types/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChat } from '@ai-sdk/react';


interface ChatModalProps {
  topic: Topic;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ topic, onClose, isOpen }: ChatModalProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  const { messages, input, handleInputChange, handleSubmit, append, status } =
    useChat({
      api: "/api/chat",
      body: {
        language,
        topic
      }
    });

  const topicText = JSON.stringify(topic);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    append({
      role: 'user',
      content: JSON.stringify(topicText)
    });
  }, [isOpen]);

  const meesagesWithoutExplainPrompt = messages.slice(1);

  if(!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
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
          {meesagesWithoutExplainPrompt.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[95%] rounded-2xl px-4 py-2 ${message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white/10 text-white rounded-bl-sm'
                  }`}
              >
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="absolute bottom-0 left-0 right-0 bg-black border-t border-white/10">
          <form onSubmit={handleSubmit} className="p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Message"
                className="flex-1 bg-white/10 rounded-full px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20"
              />
              <button
                type="submit"
                className="p-2"
              >
                <Send className={`w-6 h-6 ${input.trim() ? 'text-white' : 'text-white/50'}`} />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 