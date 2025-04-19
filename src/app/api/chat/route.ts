import { Message, streamChatContent } from '@/lib/chat';
import { readPromptFile } from '@/lib/openai';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { teaser, message, history, language } = await request.json();
    const systemPrompt = await readPromptFile(1);

    // Prepare the conversation history with system context
    const messages: Message[] = [
      {
        role: 'system',
        content: systemPrompt
          .replace('{language}', language)
      },
      ...history.map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      })),
      (message ?
        {
          role: 'user',
          content: message
        } :
        {
          role: 'user',
          content: `Please explain this fact in detail: ${teaser}`
        }
      )
    ];

    // Create a stream for the OpenAI response
    const stream = streamChatContent(messages);

    // Return the stream response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 