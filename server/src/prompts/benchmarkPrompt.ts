export const getBenchmarkPrompt = (userText: string, competitorText: string, platform: string) => {
  return `You are an expert social media analyst.
Compare two social media posts intended for ${platform}.
Post A (User's Post):
"${userText}"

Post B (Competitor's Post):
"${competitorText}"

Evaluate both posts across 5 dimensions out of 100: hookStrength, emotionalResonance, ctaClarity, readability, hashtagEffectiveness.
Then determine an overall score for each (0-100).
Finally, provide 2-3 specific things the competitor did better, and 2-3 strengths of the user's post.

Provide your response strictly in the following JSON format:
{
  "userScore": 85,
  "competitorScore": 92,
  "userBreakdown": {
    "hookStrength": { "score": 80, "reasoning": "string" },
    "emotionalResonance": { "score": 80, "reasoning": "string" },
    "ctaClarity": { "score": 80, "reasoning": "string" },
    "readability": { "score": 80, "reasoning": "string" },
    "hashtagEffectiveness": { "score": 80, "reasoning": "string" }
  },
  "competitorBreakdown": {
    "hookStrength": { "score": 90, "reasoning": "string" },
    "emotionalResonance": { "score": 90, "reasoning": "string" },
    "ctaClarity": { "score": 90, "reasoning": "string" },
    "readability": { "score": 90, "reasoning": "string" },
    "hashtagEffectiveness": { "score": 90, "reasoning": "string" }
  },
  "whatTheyDidBetter": ["string", "string"],
  "yourStrengths": ["string", "string"]
}
`;
};
