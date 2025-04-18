import { NextRequest, NextResponse } from 'next/server';
import { readPromptFile, generateContent, cleanJsonResponse } from '@/lib/openai';
import { Reel } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Topic name is required' },
        { status: 400 }
      );
    }
    
    const systemPrompt = await readPromptFile(1);
    
    // Replace {TOPIC_NAME} with the actual topic name in the user prompt
    const userPrompt = `Topic: ${name}`;
    
    const content = await generateContent(systemPrompt, userPrompt);

    if (!content) {
      throw new Error('Failed to generate content');
    }

    // Clean and parse the JSON response
    try {
      const cleanedContent = cleanJsonResponse(content);
      const reels: Reel[] = JSON.parse(cleanedContent);
      return NextResponse.json(reels);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in /topic endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to generate topic content' },
      { status: 500 }
    );
  }
} 