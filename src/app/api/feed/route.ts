import { NextRequest, NextResponse } from 'next/server';
import { streamFeedContent } from '@/lib/feed';
import { readPromptFile } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { language } = await request.json();
    
    const systemPrompt = await readPromptFile(0);
    const stream = await streamFeedContent(systemPrompt.replace('{language}', language));

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate feed content' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
} 