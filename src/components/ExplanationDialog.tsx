import { useState, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ExplanationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fact: string;
}

export default function ExplanationDialog({ isOpen, onClose, fact }: ExplanationDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialExplanation, setInitialExplanation] = useState('');

  // Reset states when fact changes
  useEffect(() => {
    setInitialExplanation('');
    setMessages([]);
    setInputMessage('');
    setIsLoading(false);
  }, [fact]);

  // Reset states when dialog closes
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
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fact }),
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
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

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
            { role: 'system', content: `You are an expert explaining the following scientific fact in detail: "${fact}". Provide detailed, accurate, and engaging explanations to user questions about this fact.` },
            ...messages,
            userMessage
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Add assistant message placeholder
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Detailed Explanation</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4 border-b">
          <p className="text-gray-700 italic">{fact}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {initialExplanation && (
            <div className="bg-gray-100 rounded-lg p-4 mb-6 whitespace-pre-wrap">
              {initialExplanation}
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-100 ml-auto max-w-[80%]'
                  : 'bg-gray-100 mr-auto max-w-[80%]'
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a question about this fact..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${
                isLoading || !inputMessage.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-600'
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