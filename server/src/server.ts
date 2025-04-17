import express, { Request, Response } from 'express';
import { OpenAI } from 'openai';
import * as fs from 'fs/promises';
import * as path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Types
interface Topic {
  id: string;
  category: string;
  title: string;
  teaser: string;
}

interface TextReel {
  type: 'text';
  content: string;
}

interface QuestionReel {
  type: 'question';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

type Reel = TextReel | QuestionReel;

// Cache for prompts to avoid reading files multiple times
const promptCache: { [key: string]: string } = {};

async function readPromptFile(promptNumber: number): Promise<string> {
  const cacheKey = `prompt${promptNumber}`;
  if (promptCache[cacheKey]) {
    return promptCache[cacheKey];
  }

  const promptPath = path.join(process.cwd(), '..', 'prompts', `prompt${promptNumber}.md`);
  const content = await fs.readFile(promptPath, 'utf-8');
  promptCache[cacheKey] = content;
  return content;
}

async function generateContent(systemPrompt: string, userPrompt: string): Promise<string | null> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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

// Function to clean up AI response by removing markdown code block syntax
function cleanJsonResponse(response: string): string {
  // Remove markdown code block syntax if present
  let cleaned = response.replace(/```json\n/g, '');
  cleaned = cleaned.replace(/```\n/g, '');
  cleaned = cleaned.replace(/```/g, '');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

// GET /feed endpoint
app.get('/feed', async (req: Request, res: Response) => {
  try {
    const systemPrompt = await readPromptFile(0);
    const content = await generateContent(systemPrompt, "Generate content based on the instructions in the system prompt.");
    
    if (!content) {
      throw new Error('Failed to generate content');
    }

    // Clean and parse the JSON response
    try {
      const cleanedContent = cleanJsonResponse(content);
      const topics = JSON.parse(cleanedContent);
      res.json(topics);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      res.status(500).json({ error: 'Failed to parse AI response' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate feed content' });
  }
});

// GET /topic endpoint
app.get('/topic', async (req: Request, res: Response) => {
  try {
    const topicName = req.query.name as string;
    
    if (!topicName) {
      return res.status(400).json({ error: 'Topic name is required' });
    }
    
    const systemPrompt = await readPromptFile(1);
    
    // Replace {TOPIC_NAME} with the actual topic name in the user prompt
    const userPrompt = `Topic: ${topicName}`;
    
    const content = await generateContent(systemPrompt, userPrompt);

    if (!content) {
      throw new Error('Failed to generate content');
    }

    // Clean and parse the JSON response
    try {
      const cleanedContent = cleanJsonResponse(content);
      const reels = JSON.parse(cleanedContent);
      res.json(reels);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      res.status(500).json({ error: 'Failed to parse AI response' });
    }
  } catch (error) {
    console.error('Error in /topic endpoint:', error);
    res.status(500).json({ error: 'Failed to generate topic content' });
  }
});

// POST /similar-topics endpoint
app.post('/similar-topics', async (req: Request, res: Response) => {
  try {
    const { viewed } = req.body;
    
    if (!viewed || !Array.isArray(viewed)) {
      return res.status(400).json({ error: 'Topic list must be provided as an array in the "viewed" field' });
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
      const topics = JSON.parse(cleanedContent);
      res.json(topics);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      res.status(500).json({ error: 'Failed to parse AI response' });
    }
  } catch (error) {
    console.error('Error in /similar-topics endpoint:', error);
    res.status(500).json({ error: 'Failed to generate similar topics' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 