'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

// Generates the personal AI's own first attempt with Gemini when a key is
// set. Returns { live: false } when no key is configured or the call fails —
// the client then falls back to a clearly labelled demo attempt.
export async function generateOwnAttempt(
  task: string
): Promise<{ text: string; live: boolean }> {
  if (!process.env.GEMINI_API_KEY) {
    return { text: '', live: false };
  }
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(
      `You are a general-purpose AI assistant. A user asked you: "${task}". Give a SHORT, generic first attempt (under 80 words) — a rough draft, not a polished deliverable. Do not overthink it.`
    );
    const text = result.response.text().trim();
    if (!text) return { text: '', live: false };
    return { text, live: true };
  } catch (error) {
    console.error('Gemini own-attempt generation failed:', error);
    return { text: '', live: false };
  }
}

// Generates the hired agent's deliverable with Gemini when a key is set.
// Returns { live: false } when no key is configured or the call fails —
// the client then falls back to a clearly labelled demo result.
export async function generateAgentResult(
  task: string,
  agentName: string,
  category: string
): Promise<{ text: string; live: boolean }> {
  if (!process.env.GEMINI_API_KEY) {
    return { text: '', live: false };
  }
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(
      `You are ${agentName}, a ${category} AI agent hired on the AgentBoss marketplace (the Boss Zhipin for AI agents). A client hired you for this job: "${task}". Deliver the finished work directly — no preamble, no meta commentary, under 180 words.`
    );
    const text = result.response.text().trim();
    if (!text) return { text: '', live: false };
    return { text, live: true };
  } catch (error) {
    console.error('Gemini result generation failed:', error);
    return { text: '', live: false };
  }
}
