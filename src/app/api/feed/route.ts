import { NextResponse } from 'next/server';
import { readPromptFile, generateContent, cleanJsonResponse } from '@/lib/openai';
import { Topic } from '@/types/api';

export async function GET() {
  try {
    const systemPrompt = await readPromptFile(0);
    const content = await generateContent(systemPrompt, "Generate content based on the instructions in the system prompt.");
    
    if (!content) {
      throw new Error('Failed to generate content');
    }

    // Clean and parse the JSON response
    try {
      const cleanedContent = cleanJsonResponse(content);
      const topics: Topic[] = JSON.parse(cleanedContent);
      return NextResponse.json(topics);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate feed content' },
      { status: 500 }
    );
  }
} 