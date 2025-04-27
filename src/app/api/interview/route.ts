import { generateText } from 'ai';
import { getModel } from '@/lib/models';
import { getPrompt } from '@/lib/prompts';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { answer } = await req.json();

    // Get the explanation prompt and format it with the language
    const systemPrompt = getPrompt('interview', { answer });

    // Generate text using the preferred model (defaults to OpenAI)
    const { text } = await generateText({
      model: getModel(),
      messages: [
        { role: 'system', content: systemPrompt },
      ],
    });

    return NextResponse.json({ learningPlan: text });
  } catch (error) {
    console.error('API route error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
} 