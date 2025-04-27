import { NextRequest, NextResponse } from 'next/server';
import { generateText } from "ai";
import { getModel } from "@/lib/models";
import { getPrompt } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const { learningPlan, level, language = 'English', history = [] } = await request.json();

    const systemPrompt = getPrompt('learn', { learningPlan, level, language });

    // Generate text using the preferred model (defaults to OpenAI)
    const { text } = await generateText({
      model: getModel(),
      messages: [
        { role: 'system', content: systemPrompt },
        ...history
      ],
    });

    const content = text.split('\n').map(line => JSON.parse(line));

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error generating feed content:', error);
    return NextResponse.json(
      { error: 'Failed to generate feed content' },
      {
        status: 500,
      }
    );
  }
} 