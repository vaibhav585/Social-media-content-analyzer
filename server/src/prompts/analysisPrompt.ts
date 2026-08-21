// =============================================================================
// Analysis Prompts
// Structured prompts with strict JSON schemas for social media post evaluation.
// =============================================================================

import type { Platform } from '../types';

export function buildAnalysisSystemPrompt(): string {
  return `You are a world-class Social Media Content Strategist and Viral Growth Analyst with deep expertise across Instagram, LinkedIn, Twitter/X, and Facebook.
Your objective is to thoroughly evaluate the provided post content and return a strict, valid JSON response with numerical scores and actionable intelligence.

CRITICAL INSTRUCTIONS:
1. Return ONLY pure valid JSON. Do not wrap the JSON in Markdown code fences like \`\`\`json.
2. Every numerical score MUST be an integer between 0 and 100.
3. Your feedback must be specific, hyper-actionable, and tailored to the platform algorithms.`;
}

export function buildAnalysisUserPrompt(text: string, platform: Platform): string {
  return `Analyze the following social media post for ${platform.toUpperCase()}:

"""
${text}
"""

Return a JSON object conforming strictly to this JSON schema:
{
  "engagementScore": <integer 0-100 overall potential>,
  "breakdown": {
    "hookStrength": {
      "score": <integer 0-100>,
      "reasoning": "<1-2 concise sentences explaining why the opening line grabs or fails to grab attention>"
    },
    "emotionalResonance": {
      "score": <integer 0-100>,
      "reasoning": "<1-2 sentences on how effectively the post connects emotionally or triggers discussion>"
    },
    "ctaClarity": {
      "score": <integer 0-100>,
      "reasoning": "<1-2 sentences evaluating the call-to-action or conversation trigger>"
    },
    "readability": {
      "score": <integer 0-100>,
      "reasoning": "<1-2 sentences on structure, sentence flow, formatting, and ease of reading>"
    },
    "hashtagEffectiveness": {
      "score": <integer 0-100>,
      "reasoning": "<1-2 sentences assessing hashtag quantity, relevance, and platform placement>"
    }
  },
  "sentiment": "<'positive' | 'negative' | 'neutral' | 'mixed'>",
  "suggestions": [
    "<High-impact, concrete suggestion 1>",
    "<High-impact, concrete suggestion 2>",
    "<High-impact, concrete suggestion 3>",
    "<High-impact, concrete suggestion 4>"
  ],
  "platformSpecific": {
    "optimalLength": <number recommended char count for this platform>,
    "currentLength": ${text.length},
    "lengthVerdict": "<'too_short' | 'optimal' | 'too_long'>",
    "hashtagRecommendations": ["#<tag1>", "#<tag2>", "#<tag3>", "#<tag4>", "#<tag5>"],
    "bestPostingTimes": ["<e.g. 9:00 AM EST>", "<e.g. 1:00 PM EST>", "<e.g. 6:00 PM EST>"],
    "contentFormatSuggestion": "<e.g. 'Turn this into a 5-slide carousel for 2.4x higher reach'>"
  }
}`;
}
