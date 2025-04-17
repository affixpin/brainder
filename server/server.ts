import express from 'express';
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

// Cache for prompts to avoid reading files multiple times
const promptCache: { [key: string]: string } = {};

async function readPromptFile(promptNumber: number): Promise<string> {
  const cacheKey = `prompt${promptNumber}`;
  if (promptCache[cacheKey]) {
    return promptCache[cacheKey];
  }

  const promptPath = path.join(process.cwd(), 'prompts', `prompt${promptNumber}.md`);
  const content = await fs.readFile(promptPath, 'utf-8');
  promptCache[cacheKey] = content;
  return content;
}

async function generateContent(prompt: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

// GET /feed endpoint
app.get('/feed', async (req, res) => {
  try {
    const prompt = await readPromptFile(0);
    const content = await generateContent(prompt);
    
    // Parse the generated content into the expected format
    const facts = content.split('\n\n').filter(fact => fact.trim());
    const topics = facts.map((fact, index) => {
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
app.get('/topic', async (req, res) => {
  try {
    const topicName = req.query.name as string;
    
    if (!topicName) {
      return res.status(400).json({ error: 'Topic name is required' });
    }
    
    let prompt = await readPromptFile(1);
    
    // Replace {TOPIC_NAME} with the actual topic name
    prompt = prompt.replace('{TOPIC_NAME}', topicName);
    
    const content = await generateContent(prompt);

    // Parse the generated content into reels format
    const reels = content.split('\n\n').map(section => {
      if (section.includes('?')) {
        // This is a question
        const [question, ...options] = section.split('\n');
        const correctAnswer = parseInt(options.pop() || '0');
        const explanation = options.pop() || '';
        
        return {
          type: 'question',
          question: question.trim(),
          options: options.map(opt => opt.trim().replace(/^[*-] /, '')),
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
app.get('/similar-topics', async (req, res) => {
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
    
    let prompt = await readPromptFile(2);
    
    // Replace the list in prompt2 with the actual topic list
    const topicListText = topicList.map(topic => `- ${topic}`).join('\n');
    prompt = prompt.replace(/Previously completed facts:\s*- \[Fact 1\]\s*- \[Fact 2\]\s*- \.\.\./, 
                           `Previously completed facts:\n${topicListText}`);
    
    const content = await generateContent(prompt);
    
    // Parse the generated content into similar topics format
    const topics = content.split('\n\n').map((topic, index) => {
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