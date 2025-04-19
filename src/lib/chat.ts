export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function streamChatContent(messages: Message[]): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      try {
        // Validate messages array to ensure all elements are valid
        if (!Array.isArray(messages) || messages.length === 0) {
          throw new Error('Messages array must be a non-empty array');
        }

        // Filter out any null or invalid messages
        const validMessages = messages.filter(msg => 
          msg && 
          typeof msg === 'object' && 
          typeof msg.role === 'string' && 
          typeof msg.content === 'string'
        );

        if (validMessages.length === 0) {
          throw new Error('No valid messages found in the array');
        }

        // Get the streaming response from OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: validMessages,
            stream: true,
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('OpenAI API error details:', errorData);
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        // Process the streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get response reader');
        }
        
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Process the chunk
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const json = JSON.parse(data);
                const content = json.choices[0]?.delta?.content || '';
                if (content) {
                  // Send the content chunk to the client
                  controller.enqueue(new TextEncoder().encode(content));
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Streaming error:', error);
        controller.error(error);
      } finally {
        controller.close();
      }
    }
  });
}