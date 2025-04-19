import { OpenAI } from 'openai';
import * as fs from 'fs/promises';
import * as path from 'path';

// Cache for prompts to avoid reading files multiple times
const promptCache: { [key: string]: string } = {};

export async function readPromptFile(promptNumber: number): Promise<string> {
  const cacheKey = `prompt${promptNumber}`;
  if (promptCache[cacheKey]) {
    return promptCache[cacheKey];
  }

  const promptPath = path.join(process.cwd(), 'prompts', `prompt${promptNumber}.md`);
  const content = await fs.readFile(promptPath, 'utf-8');
  promptCache[cacheKey] = content;
  return content;
}

export async function generateContent(systemPrompt: string, userPrompt: string): Promise<string | null> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating content:', error);
    return null;
  }
}

export function cleanJsonResponse(response: string): string {
  // Remove markdown code block syntax if present
  let cleaned = response.replace(/```json\n/g, '');
  cleaned = cleaned.replace(/```\n/g, '');
  cleaned = cleaned.replace(/```/g, '');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
} 