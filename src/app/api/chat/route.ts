import { Message } from '@/lib/chat';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const getSystemPrompt = (language: string) => `You are an expert science communicator. Your task is to provide a detailed, engaging, and accurate explanation of a scientific fact. You MUST respond in ${language}.

Break down the explanation into these sections:
1. Core Concept: A clear explanation of the main idea
2. Scientific Background: The underlying science that makes this fact true
3. Real-World Applications: How this knowledge is used or observed in the real world
4. Interesting Details: Additional fascinating aspects related to this fact

Keep each section concise but informative. Use clear, engaging language that a general audience can understand.`;

export async function POST(req: Request) {
  try {
    const { teaser, language, history, message } = await req.json();

    if (!teaser) {
      return new Response(
        JSON.stringify({ error: 'Fact is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const messages: Message[] = [
      {
        role: 'system',
        content: getSystemPrompt(language)
      },
      {
        role: 'user',
        content: `Please explain this fact in detail: ${teaser}`
      },
      ...history,
    ];
    if (message) {
      messages.push({
        role: 'user',
        content: message
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      stream: true,
      messages,
    });

    // Create a TransformStream for text encoding
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Process the stream
    (async () => {
      try {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            await writer.write(encoder.encode(content));
          }
        }
      } catch (error) {
        console.error('Streaming error:', error);
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('API route error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
} 