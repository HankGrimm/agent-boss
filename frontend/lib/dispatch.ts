import { services, type Service } from './services-data';

// Keyword router: maps a task to the agent category that should handle it.
// Used by the AI Dispatch page. Deterministic, no API key needed.
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Design: ['design', 'logo', 'brand', 'poster', 'banner', 'icon', 'mockup', 'ui'],
  Data: ['data', 'analy', 'sales', 'chart', 'csv', 'spreadsheet', 'numbers', 'metrics', 'report'],
  Writing: ['video', 'script', 'write', 'blog', 'article', 'copy', 'content', 'story', 'essay', 'caption', 'ad'],
  Code: ['code', 'review', 'audit', 'contract', 'solidity', 'debug', 'bug', 'refactor', 'test'],
  Research: ['research', 'find', 'compare', 'market', 'competitor', 'survey', 'investigat'],
  Audio: ['voice', 'audio', 'narration', 'podcast', 'voiceover', 'speak'],
};

export function routeTask(task: string): {
  category: string | null;
  agent: Service | null;
} {
  const lower = task.toLowerCase();
  let bestCategory: string | null = null;
  let bestScore = 0;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.reduce(
      (acc, kw) => acc + (lower.includes(kw) ? 1 : 0),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  if (!bestCategory || bestScore === 0) return { category: null, agent: null };
  const candidates = services.filter((s) => s.category === bestCategory);
  if (candidates.length === 0) return { category: bestCategory, agent: null };
  // Top-rated agent in the category wins the job.
  const top = [...candidates].sort(
    (a, b) => (b.rating ?? 0) - (a.rating ?? 0)
  )[0];
  return { category: bestCategory, agent: top };
}

// Fee split on every hire (MON). 80% to the agent, 10% to AI fuel, 10% to
// the platform treasury.
export function feeSplit(priceMon: number) {
  return {
    agent: priceMon * 0.8,
    fuel: priceMon * 0.1,
    treasury: priceMon * 0.1,
  };
}

// The personal AI's own first attempt — deliberately a rough draft, not a
// polished deliverable. Used when no Gemini key is configured. Clearly
// labelled as a demo attempt in the UI.
export function mockAttempt(task: string, category: string | null): string {
  const t = task.length > 90 ? task.slice(0, 90) + '…' : task;
  switch (category) {
    case 'Design':
      return `Quick draft for "${t}": a plain circle with the brand name in a default font. It works, but it's generic — no real concept, no color system, no typography thinking.`;
    case 'Data':
      return `Quick take on "${t}": the numbers went up overall. I don't have a real breakdown, the key drivers, or anything I can stand behind.`;
    case 'Writing':
      return `Rough draft for "${t}": "Introducing our new thing. It's great. You'll love it." Serviceable, but flat — no hook, no structure, no real craft.`;
    case 'Code':
      return `Skimmed it for "${t}": looks mostly fine at a glance, but I can't verify the security issues properly — and that's the part that matters.`;
    case 'Research':
      return `Quick summary for "${t}": the market is big and growing. No verified sources, no key numbers, nothing to cite.`;
    case 'Audio':
      return `For "${t}": I can describe how it should sound, but I can't record audio at all.`;
    default:
      return `Here's my take on "${t}": a short, direct answer. Simple enough that I can handle it myself.`;
  }
}

// The personal AI judges its own attempt. A rough draft is not good enough
// for specialist work — if the job belongs to a category with a top-rated
// agent, the attempt is judged weak and the job gets delegated. Simple jobs
// with no specialist category pass.
export function judgeAttempt(task: string): {
  weak: boolean;
  reason: string;
  category: string | null;
  agent: Service | null;
} {
  const { category, agent } = routeTask(task);
  if (!agent || !category) {
    return {
      weak: false,
      reason: 'Simple enough — my own answer covers it, no need to hire anyone.',
      category: null,
      agent: null,
    };
  }
  const reasons: Record<string, string> = {
    Design:
      'My attempt is only a rough draft — no real concept, color system, or typography. A real logo needs a specialist.',
    Data:
      'My attempt is a surface skim — no real breakdown, drivers, or numbers I can stand behind.',
    Writing:
      'My draft is flat — no hook, no structure, no real craft. This deserves a specialist.',
    Code:
      "I can skim code, but I can't verify security properly. This needs a real reviewer.",
    Research:
      'My summary has no verified sources or key numbers. That is not good enough.',
    Audio: "I can't record audio at all — this needs a voiceover artist.",
  };
  return {
    weak: true,
    reason: reasons[category] ?? 'My attempt is only a rough draft — this needs a specialist.',
    category,
    agent,
  };
}

// Demo result templates, used when no Gemini key is configured.
// Clearly labelled as demo results in the UI.
export function mockResult(task: string, agent: Service): string {
  const t = task.length > 90 ? task.slice(0, 90) + '…' : task;
  switch (agent.category) {
    case 'Design':
      return `Logo concept for "${t}": a bold geometric mark — a rising arc over a solid wordmark — in Monad purple (#A100FF) on near-black, with a single accent color for energy. Delivered as a concept board: primary mark, monochrome version, and a 3-color palette (purple / ink / off-white) with typography notes.`;
    case 'Data':
      return `Analysis of "${t}": the top finding is a clear upward trend in the last 3 periods, with one outlier week worth a second look. Key numbers: +18% vs the previous period, top segment driving 42% of the total, and a 6% dip in the weakest segment. Recommendation: double down on the top segment and re-check the outlier.`;
    case 'Writing':
      return `60-second script for "${t}":\nHOOK (0-5s): "You have 10 seconds to care about this."\nBEATS (5-45s): the problem in one line, the fix in three beats, one proof point.\nCTA (45-60s): "Try it now — link in bio." Tone: direct, no fluff, one idea per beat.`;
    case 'Code':
      return `Review of "${t}": 3 findings.\n1. HIGH — unchecked external call before state update (reentrancy risk); fix with checks-effects-interactions.\n2. MEDIUM — unbounded loop over a growing array; cap it or paginate.\n3. LOW — redundant storage read in a hot path; cache it in memory. No critical blockers beyond #1.`;
    case 'Research':
      return `Research summary for "${t}": the market is crowded but fragmented — the top 3 players hold ~55% share and all compete on price, not quality. The gap: no one owns the "simple + reliable" position. Key numbers and 3 sources attached in the full report.`;
    case 'Audio':
      return `Voiceover for "${t}": recorded in a warm, confident tone at a natural pace (~150 wpm), studio-clean with no background noise. Delivered as a single WAV + an MP3, with pauses tuned for a 60-second cut.`;
    default:
      return `Done — "${t}" is complete. Full output is attached to this hire.`;
  }
}
