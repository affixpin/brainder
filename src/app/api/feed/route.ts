import { NextRequest, NextResponse } from 'next/server';
import { generateText } from "ai";
import { getModel } from "@/lib/models";

const getSystemPrompt = (language: string, search: string, existingTopics: string[] = []) => {
  const existingTopicsSection = existingTopics.length > 0 
    ? `\nIMPORTANT: Do NOT generate facts with these titles, as they've already been shown to the user:\n${existingTopics.map(title => `- "${title}"`).join('\n')}`
    : '';
  
  const themeSection = search
    ? `**Generate facts based on the following keyword** - ${search}`
    : '**Cover a variety of fields** — such as astrophysics, quantum theory, evolution, neuroscience, ancient biology, etc.';
  
  return `You are an expert science communicator and writer for a short-form educational platform. Your task is to generate **high-impact, scientifically accurate micro-facts** — each one like a short "text-based Reel" designed to immediately grab attention.

Each fact must follow these strict rules:
1. ${themeSection}  
2. **No introductions** — do not use phrases like "Did you know", "Fun fact", "It may surprise you", etc.  
3. **Start directly with the core of the fact** — hit hard from the first word  
4. **Keep it short and dense** — 2 to 4 punchy sentences max  
5. **Use vivid, clear, emotional, and visual language**  
6. **100% scientifically correct** — no exaggeration, no pseudoscience  
7. **Avoid clichés** — don't repeat basic school-level facts or overused trivia  
8. **Style matters** — this is for a modern audience who scrolls quickly. You only have 2 seconds to earn their attention. No fluff.
9. **No repetition** — do not include any facts that have already been shown earlier in this conversation.
10. Avoid sounding like an encyclopedia — your goal is to **evoke wonder** and **hook the user's attention**.
11. Keep your tone **friendly, slightly playful, and intellectually stimulating**.${existingTopicsSection}

**Example fact:**  
"Each time you recall a memory, your brain subtly rewrites it. Over time, you might remember the story you've told — not the event itself."

Each title should be short, capture attention immediately. It must relate directly to the fact's content — be specific, not vague

### Output Format:
Return your response as a stream of JSON objects, one per line. Each line should be a complete, valid JSON object with the following structure:

\`\`\`json
{"id": "1", "category": "Category name", "title": "Bold headline", "teaser": "Fact content - 2 to 4 vivid, accurate, surprising sentences."}
{"id": "2", "category": "Another category", "title": "Another headline", "teaser": "Another fact content."}
\`\`\`

Make sure:
1. Each line is a complete, valid JSON object
2. No commas between objects
3. No array brackets
4. No additional text before or after the JSON objects

You MUST respond in ${language}.`;
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