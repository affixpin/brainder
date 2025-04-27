import { NextRequest, NextResponse } from 'next/server';
import { generateText } from "ai";
import { getModel } from "@/lib/models";
import { getPrompt } from '@/lib/prompts';

const getSystemPrompt = (language: string, search: string, history: string[] = []) => {
  const historySection = history.length > 0 
    ? `\nIMPORTANT: Do NOT generate facts with these titles, as they've already been shown to the user:\n${history.join(';')}`
    : '';
  
  const themeSection = search
    ? `**Generate facts based on the following keyword** - ${search}`
    : '**Cover a variety of fields** — such as astrophysics, quantum theory, evolution, neuroscience, ancient biology, etc.';
  
  return getPrompt('discover', {
    language,
    historySection,
    themeSection
  });
}

export async function POST(request: NextRequest) {
  try {
    const { language = 'English', search, history = [] } = await request.json();

    const systemPrompt = getSystemPrompt(language, search, history);

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