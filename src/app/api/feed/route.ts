import { NextResponse } from 'next/server';
import { streamFeedContent } from '@/lib/feed';
import { readPromptFile } from '@/lib/openai';

export async function GET() {
  try {
    const systemPrompt = await readPromptFile(0);
    const stream = await streamFeedContent(systemPrompt);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate feed content' },
      { status: 500 }
    );
  }
} 