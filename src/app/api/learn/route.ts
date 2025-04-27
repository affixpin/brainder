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
  const historySection = history.length > 0 
    ? `\nIMPORTANT: Do NOT generate topics with these titles, as they've already been shown to the user:\n${history.map(title => `- "${title}"`).join('\n')}`
    : '';
  
  return getPrompt('learn', {
    language,
    level,
    learningPlan,
    historySection
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