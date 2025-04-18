import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { topicId, message, history } = await request.json();

    if (!topicId || !message) {
      return NextResponse.json(
        { error: 'Topic ID and message are required' },
        { status: 400 }
      );
    }

    // Fetch topic details to provide context
    const topicResponse = await fetch(`${request.nextUrl.origin}/api/feed`);
    const topics = await topicResponse.json();
    const topic = topics.find((t: any) => t.id === topicId);

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Prepare the conversation history with system context
    const messages = [
      {
        role: 'system',
        content: `You are a helpful AI assistant discussing the topic: "${topic.title}" from the category "${topic.category}". 
        Your goal is to provide accurate, engaging, and educational responses about this topic.
        Use the following context about the topic: "${topic.teaser}"
        Keep your responses concise, friendly, and informative.`
      },
      ...history.map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // Generate response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content;

    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 