import { NextRequest, NextResponse } from 'next/server';
import { readPromptFile, generateContent, cleanJsonResponse } from '@/lib/openai';
import { Topic } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const { viewed } = await request.json();
    
    if (!viewed || !Array.isArray(viewed)) {
      return NextResponse.json(
        { error: 'Topic list must be provided as an array in the "viewed" field' },
        { status: 400 }
      );
    }
    
    const systemPrompt = await readPromptFile(2);
    
    // Create user prompt with the topic list
    const topicListText = viewed.map(topic => `- ${topic}`).join('\n');
    const userPrompt = `Previously completed facts:\n${topicListText}`;
    
    const content = await generateContent(systemPrompt, userPrompt);
    
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
    console.error('Error in /similar-topics endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to generate similar topics' },
      { status: 500 }
    );
  }
} 