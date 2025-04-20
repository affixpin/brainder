import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

// Initialize API clients based on available environment variables
export const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const anthropic =
    createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    })

const provider = process.env.AI_PROVIDER || 'openai';

// Get model based on preference or environment variable
export function getModel() {
    if (provider === 'anthropic') {
        return anthropic("claude-3-opus-20240229");
    }

    return openai("gpt-4");
} 