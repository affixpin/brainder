import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const getSystemPrompt = (language: string) => `You are an intelligent assistant designed to present users with short, captivating science facts — like a Tinder/TikTok for the brain. Each interaction is based on a card containing one interesting, snackable science insight. You MUST respond in ${language}.

Each fact must follow these strict rules:
1. **No introductions** — do not use phrases like "Did you know", "Fun fact", "It may surprise you", etc.  
2. **Start directly with the core of the fact** — hit hard from the first word  
3. **Keep it short and dense** — 2 to 4 punchy sentences max  
4. **Use vivid, clear, emotional, and visual language**  
5. **100% scientifically correct** — no exaggeration, no pseudoscience  
6. **Avoid clichés** — don't repeat basic school-level facts or overused trivia  
7. **Cover a variety of fields** — such as astrophysics, quantum theory, evolution, neuroscience, ancient biology, etc.  
8. **Style matters** — this is for a modern audience who scrolls quickly. You only have 2 seconds to earn their attention. No fluff.
9. Each card contains **one short and punchy science fact**, written in 2–3 sentences max.
10. Avoid sounding like an encyclopedia — your goal is to **evoke wonder** and **hook the user's attention**.
11. Keep your tone **friendly, slightly playful, and intellectually stimulating**.
12. If the user responds **"Yes"**, generate another fact in a **similar topic or domain** (e.g., if they liked a neuroscience fact, give another brain-related or cognitive one).
13. If the user responds **"No"**, switch to a **different topic** — change the scientific domain or tone to spark curiosity again.

**Example fact:**  
"Each time you recall a memory, your brain subtly rewrites it. Over time, you might remember the story you've told — not the event itself."`;

// Set the runtime to edge for best performance
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    console.log('API route called');
    const { messages, language = 'Ukrainian' } = await req.json();
    console.log('Received messages:', messages, 'Language:', language);

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      stream: true,
      messages: [
        { role: 'system', content: getSystemPrompt(language) },
        ...messages
      ],
    });

    // Create a TransformStream for text encoding
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Process the stream
    (async () => {
      try {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            await writer.write(encoder.encode(content));
          }
        }
      } catch (error) {
        console.error('Streaming error:', error);
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('API route error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
} 