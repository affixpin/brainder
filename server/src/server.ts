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

// GET /feed endpoint
app.get('/feed', async (req: Request, res: Response) => {
  try {
    const systemPrompt = await readPromptFile(0);
    const content = await generateContent(systemPrompt, "Generate content based on the instructions in the system prompt.");
    
    if (!content) {
      throw new Error('Failed to generate content');
    }

    // Parse the generated content into the expected format
    const facts = content.split('\n\n').filter((fact: string) => fact.trim());
    const topics: Topic[] = facts.map((fact: string, index: number) => {
      const [categoryLine, ...contentLines] = fact.split('\n');
      const category = categoryLine.replace('[', '').split(']:')[0];
      const title = categoryLine.split(']:')[1]?.trim() || '';
      const teaser = contentLines.join('\n').trim();
      
      return {
        id: String(index + 1),
        category,
        title,
        teaser
      };
    });

    res.json(topics);
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

    // Parse the generated content into reels format
    const reels: Reel[] = content.split('\n\n').map((section: string) => {
      if (section.includes('?')) {
        // This is a question
        const [question, ...options] = section.split('\n');
        const correctAnswer = parseInt(options.pop() || '0');
        const explanation = options.pop() || '';
        
        return {
          type: 'question',
          question: question.trim(),
          options: options.map((opt: string) => opt.trim().replace(/^[*-] /, '')),
          correctAnswer,
          explanation: explanation.trim()
        };
      } else {
        // This is a text block
        return {
          type: 'text',
          content: section.trim()
        };
      }
    });

    res.json(reels);
  } catch (error) {
    console.error('Error in /topic endpoint:', error);
    res.status(500).json({ error: 'Failed to generate topic content' });
  }
});

// GET /similar-topics endpoint
app.get('/similar-topics', async (req: Request, res: Response) => {
  try {
    const topicListParam = req.query.viewed as string;
    
    if (!topicListParam) {
      return res.status(400).json({ error: 'Topic list is required' });
    }
    
    // Parse the topic list from the query parameter
    let topicList: string[];
    try {
      topicList = JSON.parse(topicListParam);
      if (!Array.isArray(topicList)) {
        return res.status(400).json({ error: 'Topic list must be an array' });
      }
    } catch (e) {
      return res.status(400).json({ error: 'Invalid topic list format' });
    }
    
    const systemPrompt = await readPromptFile(2);
    
    // Create user prompt with the topic list
    const topicListText = topicList.map(topic => `- ${topic}`).join('\n');
    const userPrompt = `Previously completed topics:\n${topicListText}`;
    
    const content = await generateContent(systemPrompt, userPrompt);
    
    if (!content) {
      throw new Error('Failed to generate content');
    }

    // Parse the generated content into similar topics format
    const topics: Topic[] = content.split('\n\n').map((topic: string, index: number) => {
      const [title, teaser] = topic.split('\n');
      return {
        id: String(index + 1),
        title: title.trim(),
        teaser: teaser?.trim() || '',
        category: 'Related Topics'
      };
    });

    res.json(topics);
  } catch (error) {
    console.error('Error in /similar-topics endpoint:', error);
    res.status(500).json({ error: 'Failed to generate similar topics' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 