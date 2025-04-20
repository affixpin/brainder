import { streamText } from 'ai';
import { getModel } from '@/lib/models';

const getSystemPrompt = (language: string) => `You are an expert science communicator. Your task is to provide a detailed, engaging, and accurate explanation of a scientific fact. You MUST respond in ${language}.

Break down the explanation into these sections:
1. Core Concept: A clear explanation of the main idea
2. Scientific Background: The underlying science that makes this fact true
3. Real-World Applications: How this knowledge is used or observed in the real world
4. Interesting Details: Additional fascinating aspects related to this fact

Keep each section concise but informative. Use clear, engaging language that a general audience can understand.`;

export async function POST(req: Request) {
  try {
    const { messages = [], language} = await req.json();

    // Ensure system prompt with correct language is included
    const systemMessage = {
      role: 'system',
      content: getSystemPrompt(language || 'English')
    };

    const allMessages =  [systemMessage, ...messages];

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