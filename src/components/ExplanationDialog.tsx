import { useState, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ExplanationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fact: string;
  language: string;
}

export default function ExplanationDialog({ isOpen, onClose, fact, language }: ExplanationDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialExplanation, setInitialExplanation] = useState('');

  useEffect(() => {
    setInitialExplanation('');
    setMessages([]);
    setInputMessage('');
    setIsLoading(false);
  }, [fact]);

  useEffect(() => {
    if (!isOpen) {
      setInitialExplanation('');
      setMessages([]);
      setInputMessage('');
      setIsLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !initialExplanation) {
      fetchInitialExplanation();
    }
  }, [isOpen, fact]);

  const fetchInitialExplanation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fact, language }),
      });

      if (!response.ok) {
        throw new Error('Failed to get explanation');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let streamedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        const chunk = decoder.decode(value);
        streamedContent += chunk;
        setInitialExplanation(streamedContent);
      }
    } catch (error) {
      console.error('Error getting initial explanation:', error);
      setInitialExplanation('Sorry, I encountered an error while generating the explanation. Please try asking specific questions instead.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `You are an expert explaining the following scientific fact in detail: "${fact}". Provide detailed, accurate, and engaging explanations to user questions about this fact. You MUST respond in ${language}.` },
            ...messages,
            userMessage
          ],
          language
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: ''
      }]);
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let streamedContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        const chunk = decoder.decode(value);
        streamedContent += chunk;
        
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: streamedContent
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error getting explanation:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while generating the explanation. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col shadow-xl border border-gray-800">
        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
            Detailed Explanation
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`text-gray-400 hover:text-gray-200 transition-colors p-1 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-800">
          <p className="text-sm sm:text-base text-gray-300 italic">{fact}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
          {initialExplanation && (
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 whitespace-pre-wrap text-sm sm:text-base text-gray-200">
              {initialExplanation}
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 sm:p-4 rounded-xl text-sm sm:text-base ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white ml-auto max-w-[85%] sm:max-w-[80%]'
                  : 'bg-gray-800 text-gray-200 mr-auto max-w-[85%] sm:max-w-[80%]'
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>

        <div className="p-3 sm:p-4 md:p-6 border-t border-gray-800">
          <div className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              placeholder="Ask a question about this fact..."
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800 border border-gray-700 text-sm sm:text-base text-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full text-sm sm:text-base transition-all duration-200 ${
                isLoading || !inputMessage.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5'
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 