import { Message, streamContent } from '@/lib/openai';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { topic, message, history } = await request.json();

    // Prepare the conversation history with system context
    const messages: Message[] = [
      {
        role: 'system',
        content: `You are a helpful AI assistant discussing the topic: "${topic.title}" from the category "${topic.category}". 
        Your goal is to provide accurate, engaging, and educational responses about this topic.
        Use the following context about the topic: "${topic.teaser}"
        Keep your responses concise, friendly, and informative.`
      },
      ...history.map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      })),
      (message && {
        role: 'user',
        content: message
      })
    ];

    // Create a stream for the OpenAI response
    const stream = streamContent(messages);

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