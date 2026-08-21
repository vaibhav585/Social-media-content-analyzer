export const getRewritePrompt = (text: string, platform: string, goal: string, toneExamples?: string[]) => {
  let goalInstructions = '';
  switch (goal) {
    case 'max_reach':
      goalInstructions = 'Focus on algorithm optimization: strong curiosity gap in the first line, formatted for high readability (whitespace, bullet points), and concise delivery.';
      break;
    case 'max_engagement':
      goalInstructions = 'Focus on community interaction: relatable tone, emotional resonance, and a clear, compelling question or discussion prompt at the end to drive comments.';
      break;
    case 'professional':
      goalInstructions = 'Focus on authority and thought leadership: data-driven insights, structured framework approach, and a confident, professional tone.';
      break;
    default:
      goalInstructions = 'Improve clarity and engagement.';
  }

  // Build tone-matching section if persona examples are available
  let toneMatchingSection = '';
  if (toneExamples && toneExamples.length > 0) {
    toneMatchingSection = `

CRITICAL TONE-MATCHING INSTRUCTIONS:
You MUST match the exact writing style, vocabulary, sentence structure, emoji usage, and personality of the following example posts from this user's brand voice. Study them carefully and replicate their unique tone precisely.

=== BRAND VOICE EXAMPLES ===
${toneExamples.map((example, i) => `Example ${i + 1}:\n"${example}"`).join('\n\n')}
=== END EXAMPLES ===

Your rewritten post must sound like it was written by the same person who wrote the examples above. Match their:
- Sentence length and structure
- Emoji usage patterns
- Level of formality/informality
- Catchphrases or recurring patterns
- Overall energy and personality
`;
  }

  return `You are an expert social media copywriter and algorithm specialist.
Rewrite the following post optimized specifically for ${platform}.
Your goal is: ${goalInstructions}
${toneMatchingSection}
ORIGINAL POST:
"${text}"

Provide your response strictly in the following JSON format:
{
  "goal": "${goal}",
  "rewrittenText": "The fully rewritten content here, preserving line breaks appropriately.",
  "improvementNotes": "A short, 1-2 sentence explanation of what you changed and why."
}
`;
};
