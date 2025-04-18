import { OpenAI } from 'openai';
import * as fs from 'fs/promises';
import * as path from 'path';

// Cache for prompts to avoid reading files multiple times
const promptCache: { [key: string]: string } = {};

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function readPromptFile(promptNumber: number): Promise<string> {
  const cacheKey = `prompt${promptNumber}`;
  if (promptCache[cacheKey]) {
    return promptCache[cacheKey];
  }

  const promptPath = path.join(process.cwd(), 'prompts', `prompt${promptNumber}.md`);
  const content = await fs.readFile(promptPath, 'utf-8');
  promptCache[cacheKey] = content;
  return content;
}

export async function generateContent(systemPrompt: string, userPrompt: string): Promise<string | null> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating content:', error);
    return null;
  }
}

export function streamContent(messages: Message[]): ReadableStream {
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
            model: 'gpt-3.5-turbo',
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
            if (line.includes('[DONE]')) continue;
            if (!line.startsWith('data:')) continue;

            const data = line.replace('data: ', '');
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
      } catch (error) {
        console.error('Streaming error:', error);
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });
}

export function cleanJsonResponse(response: string): string {
  // Remove markdown code block syntax if present
  let cleaned = response.replace(/```json\n/g, '');
  cleaned = cleaned.replace(/```\n/g, '');
  cleaned = cleaned.replace(/```/g, '');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
} 