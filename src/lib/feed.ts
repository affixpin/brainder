export async function streamFeedContent(systemPrompt: string): Promise<ReadableStream> {
  return new ReadableStream({
    async start(controller) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: "Generate 10 facts in the specified JSON format. Each fact should be a separate JSON object on a new line."
              }
            ],
            stream: true,
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get response reader');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

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
                  buffer += content;
                  // If we have a complete JSON object, send it
                  if (buffer.includes('\n')) {
                    const parts = buffer.split('\n');
                    buffer = parts.pop() || ''; // Keep the last incomplete part
                    for (const part of parts) {
                      if (part.trim()) {
                        controller.enqueue(new TextEncoder().encode(part + '\n'));
                      }
                    }
                  }
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
              }
            }
          }
        }

        // Send any remaining content in the buffer
        if (buffer.trim()) {
          controller.enqueue(new TextEncoder().encode(buffer + '\n'));
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