import { NextRequest, NextResponse } from 'next/server';
import { generateText } from "ai";
import { getModel } from "@/lib/models";
import { getPrompt } from '@/lib/prompts';

const getSystemPrompt = (language: string, search: string, existingTopics: string[] = []) => {
  const existingTopicsSection = existingTopics.length > 0 
    ? `\nIMPORTANT: Do NOT generate facts with these titles, as they've already been shown to the user:\n${existingTopics.map(title => `- "${title}"`).join('\n')}`
    : '';
  
  const themeSection = search
    ? `**Generate facts based on the following keyword** - ${search}`
    : '**Cover a variety of fields** — such as astrophysics, quantum theory, evolution, neuroscience, ancient biology, etc.';
  
  return getPrompt('discover', {
    language,
    existingTopicsSection,
    themeSection
  });
}

export async function POST(request: NextRequest) {
  try {
    const { language, search, existingTopics = [] } = await request.json();

    const systemPrompt = getSystemPrompt(language, search, existingTopics);

    // Generate text using the preferred model (defaults to OpenAI)
    const { text } = await generateText({
      model: getModel(),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: "Generate 5 facts in the specified JSON format. Each fact should be a separate JSON object on a new line." }
      ],
    });

    const content = text.split('\n').map(line => JSON.parse(line));

    // Additional check to filter out any duplicates that might have slipped through
    const filteredContent = content.filter(topic => 
      !existingTopics.includes(topic.title)
    );

    return NextResponse.json(filteredContent);
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