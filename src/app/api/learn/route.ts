import { NextRequest, NextResponse } from 'next/server';
import { generateText } from "ai";
import { getModel } from "@/lib/models";
import { getPrompt } from '@/lib/prompts';

type LearnSystemPromptType = {
  language: string;
  level: string;
  learningPlan: string;
  history: string[];
};

const getSystemPrompt = ({ language, level, learningPlan, history }: LearnSystemPromptType) => {
  return getPrompt('learn', {
    language,
    level,
    learningPlan,
    history: history.join(';'),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { language = 'English', learningPlan, level, history = [] } = await request.json();

    const systemPrompt = getSystemPrompt({ language, level, learningPlan, history });

    // Generate text using the preferred model (defaults to OpenAI)
    const { text } = await generateText({
      model: getModel(),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: "Generate 1 fact in the specified JSON format." }
      ],
    });

    return NextResponse.json(JSON.parse(text));
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