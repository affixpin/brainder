import { streamText } from 'ai';
import { getModel } from '@/lib/models';
import { getPrompt } from '@/lib/prompts';

export async function POST(req: Request) {
  try {
    const { messages = [], language = 'English' } = await req.json();

    // Get the explanation prompt and format it with the language
    const systemPrompt = getPrompt('interview', { language });

    // Ensure system prompt with correct language is included
    const systemMessage = {
      role: 'system',
      content: systemPrompt
    };

    const allMessages = [systemMessage, ...messages];

    // Use streamText from ai package
    const result = await streamText({
      model: getModel(),
      messages: allMessages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('API route error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
} 