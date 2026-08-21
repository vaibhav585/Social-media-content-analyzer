// =============================================================================
// Local Heuristics Engine (Zero AI — Layer 4 Failover)
// Algorithmic analysis using NLP formulas, AFINN sentiment lexicon, & platform matrices.
// Dynamically scores posts with platform-specific audience expectations & algorithms.
// =============================================================================

import type { AnalysisResult, Platform, Sentiment } from '../../types';

// ── Sentiment Lexicon ─────────────────────────────────────────────────────────

const POSITIVE_WORDS = new Set([
  'great', 'amazing', 'excellent', 'love', 'loved', 'loving', 'best', 'awesome',
  'incredible', 'success', 'successful', 'win', 'winning', 'growth', 'grow',
  'transform', 'breakthrough', 'valuable', 'insight', 'insights', 'helpful',
  'inspiring', 'excited', 'exciting', 'proud', 'top', 'boost', 'mastery', 'power',
  'powerful', 'gamechanger', 'game-changing', 'benefit', 'effective', 'flourish',
  'brilliant', 'creative', 'innovative', 'perfect', 'solution', 'happy', 'super',
  'revenue', 'scale', 'scaling', 'profit', 'roi', 'leadership', 'strategy'
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'terrible', 'worst', 'fail', 'failed', 'failing', 'failure', 'hate',
  'hated', 'awful', 'poor', 'struggle', 'struggling', 'mistake', 'mistakes',
  'waste', 'wasting', 'problem', 'problems', 'loss', 'lose', 'losing', 'drop',
  'dropped', 'broken', 'disaster', 'crisis', 'stuck', 'boring', 'weak', 'risk',
  'fear', 'stress', 'frustrated', 'annoying', 'regret', 'warning', 'danger'
]);

const POWER_WORDS = new Set([
  'secret', 'secrets', 'strategy', 'framework', 'formula', 'proven', 'mistake',
  'stop', 'never', 'how', 'why', 'hack', 'hacks', 'cheat-sheet', 'guide',
  'blueprint', 'truth', 'revealed', 'uncovered', 'ultimate', 'essential', 'free',
  'skyrocketed', 'boosted', 'masterclass', 'lessons', 'breakdown', 'rules'
]);

const CTA_PATTERNS = [
  /\b(link in bio|link in comments|click the link|tap the link)\b/i,
  /\b(comment below|drop a comment|what do you think|thoughts\?|let me know)\b/i,
  /\b(share this|repost this|tag a friend|retweet)\b/i,
  /\b(save this|bookmark this|save for later)\b/i,
  /\b(dm me|send a message|reach out|send a dm)\b/i,
  /\b(sign up|subscribe|register|join now|download)\b/i,
  /\b(follow for more|follow me)\b/i,
];

// ── Readability (Flesch-Kincaid) ──────────────────────────────────────────────

function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (clean.length <= 3) return 1;
  const matches = clean.match(/[aeiouy]{1,2}/g);
  let count = matches ? matches.length : 1;
  if (clean.endsWith('e') && !clean.endsWith('le')) count--;
  return Math.max(1, count);
}

function calculateFleschKincaid(text: string): { readabilityScore: number; gradeLevel: number } {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  const wordCount = Math.max(1, words.length);
  const sentenceCount = Math.max(1, sentences.length);
  const syllableCount = words.reduce((acc, w) => acc + countSyllables(w), 0);

  const gradeLevel = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;
  let readabilityScore = Math.round(100 - Math.abs(gradeLevel - 7) * 7);
  readabilityScore = Math.max(20, Math.min(98, readabilityScore));

  return { readabilityScore, gradeLevel: Math.max(1, Math.round(gradeLevel * 10) / 10) };
}

// ── Platform-Specific Evaluation Engine ───────────────────────────────────────

export class LocalHeuristicsEngine {
  public analyze(text: string, platform: Platform): AnalysisResult {
    const charCount = text.length;
    const words = text.trim().split(/\s+/).filter(Boolean);
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const firstSentence = (sentences[0] || '').trim();
    const firstSentenceWords = firstSentence.toLowerCase().split(/\s+/);

    const hashtags = (text.match(/#[\w\u0590-\u05ff]+/g) || []);
    const emojis = (text.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu) || []);
    const hasQuestion = /\?/.test(text);
    const hasNumbersInHook = /\d/.test(firstSentence);

    // ── 1. Base Dimension Calculations ───────────────────────────────────────
    
    // Hook Strength Base
    let hookScore = 50;
    const hasPowerWord = firstSentenceWords.some((w) => POWER_WORDS.has(w));
    if (hasPowerWord) hookScore += 20;
    if (hasNumbersInHook) hookScore += 15;
    if (firstSentence.includes('?')) hookScore += 15;
    if (firstSentenceWords.length >= 4 && firstSentenceWords.length <= 14) hookScore += 10;
    if (firstSentenceWords.length > 22) hookScore -= 20;

    // Emotional Resonance & Sentiment
    let posCount = 0;
    let negCount = 0;
    for (const w of words) {
      const clean = w.toLowerCase().replace(/[^a-z]/g, '');
      if (POSITIVE_WORDS.has(clean)) posCount++;
      if (NEGATIVE_WORDS.has(clean)) negCount++;
    }

    let sentiment: Sentiment = 'neutral';
    if (posCount > negCount && posCount > 1) sentiment = 'positive';
    else if (negCount > posCount && negCount > 1) sentiment = 'negative';
    else if (posCount > 0 && negCount > 0) sentiment = 'mixed';

    let emotionalScore = 45 + (posCount + negCount) * 8 + emojis.length * 5;
    if (hasQuestion) emotionalScore += 10;

    // CTA Clarity
    let ctaMatches = 0;
    for (const pattern of CTA_PATTERNS) {
      if (pattern.test(text)) ctaMatches++;
    }
    let ctaScore = ctaMatches > 0 ? 75 + ctaMatches * 10 : 35;

    // Readability
    const { readabilityScore, gradeLevel } = calculateFleschKincaid(text);

    // ── 2. Platform-Specific Calibrations & Weightings ─────────────────────────

    let finalHook = hookScore;
    let finalEmotion = emotionalScore;
    let finalCTA = ctaScore;
    let finalReadability = readabilityScore;
    let finalHashtag = 50;

    let hookReason = '';
    let emotionReason = '';
    let ctaReason = '';
    let readabilityReason = '';
    let hashtagReason = '';

    let optimalLength = 150;
    let bestPostingTimes: string[] = [];
    let formatSuggestion = '';
    const suggestions: string[] = [];

    if (platform === 'linkedin') {
      optimalLength = 1400;
      bestPostingTimes = ['8:00 AM EST', '12:00 PM EST', '5:15 PM EST'];
      formatSuggestion = 'Structure with 1-line whitespace breaks between thoughts and lead with a clear framework.';

      // LinkedIn rules:
      // Length check: LinkedIn rewards long-form thought leadership (1000-1800 chars). Short posts under 400 chars suffer dwell-time penalty.
      if (charCount < 300) {
        finalReadability -= 25;
        finalEmotion -= 15;
        readabilityReason = `Post length is too brief (${charCount} chars) for LinkedIn algorithm dwell-time. Aim for 800–1,500 chars of actionable insight.`;
        suggestions.push('Expand this into a structured story or case study breakdown to increase dwell time.');
      } else if (charCount >= 800 && charCount <= 1800) {
        finalReadability = Math.min(96, finalReadability + 15);
        readabilityReason = `Ideal long-form length (${charCount} chars) maximizing algorithmic dwell-time on LinkedIn feeds.`;
      } else {
        readabilityReason = `Length (${charCount} chars) is acceptable, but formatting needs distinct spacing.`;
      }

      // Hashtag check: 3–5 tags ideal. >6 tags is penalized as spam.
      if (hashtags.length >= 3 && hashtags.length <= 5) {
        finalHashtag = 92;
        hashtagReason = `Found ${hashtags.length} hashtags — perfectly calibrated for LinkedIn topical indexing (target: 3–5).`;
      } else if (hashtags.length > 5) {
        finalHashtag = 45;
        hashtagReason = `Using ${hashtags.length} hashtags on LinkedIn triggers spam classifiers. Reduce to 3–5 high-relevance tags.`;
        suggestions.push('Reduce hashtags to 3–5 specific industry tags (e.g. #SaaS, #B2BGrowth).');
      } else if (hashtags.length === 0) {
        finalHashtag = 35;
        hashtagReason = 'No hashtags found. LinkedIn uses 3–5 tags for topic category routing.';
        suggestions.push('Add 3–5 niche hashtags to help LinkedIn classify and route your post.');
      } else {
        finalHashtag = 70;
        hashtagReason = `Found ${hashtags.length} tags. Add 1–2 more for optimal indexing.`;
      }

      // CTA check
      if (ctaMatches > 0) {
        finalCTA = Math.min(98, ctaScore + 5);
        ctaReason = 'Effective conversation-starter CTA that triggers high-value comment discussions.';
      } else {
        finalCTA = 35;
        ctaReason = 'Missing a professional discussion prompt. Ask peers for their perspective or workflow.';
        suggestions.push('End with a specific question: "How does your team handle this? Comment below."');
      }

      hookReason = hasNumbersInHook || hasPowerWord
        ? 'Compelling data/case-study hook tailored for business professionals.'
        : 'Make the first line bolder with hard metrics (e.g., "$X revenue", "Y% growth in Z days").';

      emotionReason = posCount > 0
        ? 'Strong tone of professional achievement and strategic insight.'
        : 'Inject relatable vulnerability or lessons learned to deepen peer connection.';

    } else if (platform === 'twitter') {
      optimalLength = 90;
      bestPostingTimes = ['9:00 AM EST', '12:30 PM EST', '6:00 PM EST'];
      formatSuggestion = 'Keep under 140 chars for maximum retweets, or turn into a numbered 5-tweet thread.';

      // Twitter / X rules:
      // Hard length check: Free tier max is 280 chars. Sweet spot is 70-120 chars.
      if (charCount > 280) {
        finalReadability = 30;
        finalHook -= 20;
        readabilityReason = `❌ Character count (${charCount}) EXCEEDS standard tweet limit (280 chars)! Cannot be posted as a single tweet without paid subscription.`;
        suggestions.push('Shorten post to under 280 characters or convert into a multi-tweet thread.');
      } else if (charCount <= 140) {
        finalReadability = 95;
        readabilityReason = `Punchy, concise length (${charCount} chars) ideal for high mobile retweets and quote tweets.`;
      } else {
        finalReadability = 70;
        readabilityReason = `Length (${charCount} chars) fits in a tweet, but trimming to <140 chars increases share velocity.`;
        suggestions.push('Trim filler words to get under 140 characters for higher retweet velocity.');
      }

      // Hashtag check: 1–2 tags max. >2 tags severely penalized on X.
      if (hashtags.length >= 1 && hashtags.length <= 2) {
        finalHashtag = 95;
        hashtagReason = `Found ${hashtags.length} hashtags — optimal for X algorithm (1–2 tags max).`;
      } else if (hashtags.length > 2) {
        finalHashtag = 35;
        hashtagReason = `Using ${hashtags.length} hashtags on X reduces organic reach by ~17%. Limit to 1–2 tags maximum.`;
        suggestions.push('Remove extra hashtags on X; stick strictly to 1 or 2 tags.');
      } else {
        finalHashtag = 80;
        hashtagReason = 'Zero hashtags is acceptable on modern X if keywords are strong.';
      }

      // Hook importance is paramount on X
      if (hasPowerWord || hasQuestion) {
        finalHook = Math.min(98, hookScore + 10);
        hookReason = 'High-velocity hook with immediate curiosity gap designed for fast-scrolling timelines.';
      } else {
        finalHook = 45;
        hookReason = 'Opening line lacks urgency. Lead with a punchy contrarian statement or surprise stat.';
        suggestions.push('Start with a provocative 1-line hook: "Most founders get this wrong..."');
      }

      ctaReason = ctaMatches > 0
        ? 'Direct CTA promoting quote tweets, bookmarks, or replies.'
        : 'Add a micro-ask: "Bookmark this" or "Repost if you agree".';

      emotionReason = 'Fast-paced conversational tone suited for tech and creator Twitter.';

    } else if (platform === 'instagram') {
      optimalLength = 150;
      bestPostingTimes = ['11:00 AM EST', '1:00 PM EST', '7:00 PM EST'];
      formatSuggestion = 'Pair this caption with a 5-slide visual carousel or high-contrast Reel cover.';

      // Instagram rules:
      // Emoji check: Instagram audience expects visual emotion
      if (emojis.length === 0) {
        finalEmotion -= 20;
        emotionReason = 'Missing emojis. Instagram captions require visual cues and expressive tone to stand out.';
        suggestions.push('Add 2–4 relevant emojis to structure sections and add visual color.');
      } else {
        finalEmotion = Math.min(95, emotionalScore + 10);
        emotionReason = `Great visual energy with ${emojis.length} emojis enhancing emotional connection.`;
      }

      // Hashtag check: 5–15 niche tags optimal
      if (hashtags.length >= 5 && hashtags.length <= 15) {
        finalHashtag = 94;
        hashtagReason = `Found ${hashtags.length} hashtags — ideal distribution for Instagram Explore and Search discovery.`;
      } else if (hashtags.length < 3) {
        finalHashtag = 40;
        hashtagReason = `Only ${hashtags.length} hashtags found. Instagram relies on 5–15 niche tags for discovery.`;
        suggestions.push('Include 5–10 specific community hashtags (#CreatorTips, #SaaSGrowth, #DesignInspo).');
      } else if (hashtags.length > 20) {
        finalHashtag = 55;
        hashtagReason = 'Too many hashtags (20+) look cluttered. Keep between 8–15 targeted tags.';
      } else {
        finalHashtag = 75;
        hashtagReason = `Found ${hashtags.length} hashtags. Good, but could be expanded to 5–10 for broader reach.`;
      }

      // Caption length check
      if (charCount <= 250) {
        finalReadability = 92;
        readabilityReason = 'Brevity matches modern short-form Instagram feeds where visual assets lead.';
      } else if (charCount > 800) {
        finalReadability = 65;
        readabilityReason = 'Long caption might get truncated under "more". Put the critical takeaway in the first 2 lines.';
        suggestions.push('Ensure the first 125 characters contain the main hook before the "...more" fold.');
      } else {
        finalReadability = 80;
        readabilityReason = 'Good length for value-packed educational post.';
      }

      hookReason = 'Visual curiosity trigger leading audience to swipe or read caption.';
      ctaReason = ctaMatches > 0
        ? 'Clear prompt to comment, save post, or check link in bio.'
        : 'Add "Save this for your next project 📌" or "Link in bio for full template".';

    } else { // Facebook
      optimalLength = 80;
      bestPostingTimes = ['1:00 PM EST', '3:00 PM EST', '8:00 PM EST'];
      formatSuggestion = 'Pair with an authentic photo or short video clip for 3x organic reach.';

      if (charCount <= 120) {
        finalReadability = 90;
        readabilityReason = 'Short, conversational post format ideal for Facebook Newsfeed scanning.';
      } else if (charCount > 350) {
        finalReadability = 55;
        readabilityReason = 'Long-form text has lower algorithmic distribution on standard Facebook personal/group feeds.';
        suggestions.push('Shorten the text to focus on 1 single core question or photo caption.');
      } else {
        finalReadability = 75;
        readabilityReason = 'Moderate length; keep spacing clean.';
      }

      if (hashtags.length <= 2) {
        finalHashtag = 88;
        hashtagReason = 'Light hashtag usage (1–2 tags) fits natural Facebook posting styles.';
      } else {
        finalHashtag = 40;
        hashtagReason = 'Hashtags are rarely used by regular Facebook audiences; >3 tags looks automated/spammy.';
        suggestions.push('Remove excessive hashtags on Facebook to look authentic and conversational.');
      }

      finalEmotion = Math.min(95, emotionalScore + 10);
      emotionReason = 'Relatable community tone that encourages friendly comments and shares.';
      hookReason = 'Casual and inviting opening.';
      ctaReason = ctaMatches > 0 ? 'Clear conversational prompt.' : 'Ask a simple question to prompt comments.';
    }

    // Clamp all individual scores
    finalHook = Math.max(15, Math.min(98, finalHook));
    finalEmotion = Math.max(15, Math.min(98, finalEmotion));
    finalCTA = Math.max(15, Math.min(98, finalCTA));
    finalReadability = Math.max(15, Math.min(98, finalReadability));
    finalHashtag = Math.max(15, Math.min(98, finalHashtag));

    // ── 3. Platform-Weighted Composite Overall Score ──────────────────────────
    let engagementScore = 0;

    if (platform === 'linkedin') {
      // LinkedIn rewards in-depth readability & professional value heavily
      engagementScore = Math.round(
        finalHook * 0.20 +
        finalReadability * 0.25 +
        finalEmotion * 0.25 +
        finalCTA * 0.15 +
        finalHashtag * 0.15
      );
    } else if (platform === 'twitter') {
      // Twitter rewards extreme brevity & punchy hook above all
      engagementScore = Math.round(
        finalHook * 0.35 +
        finalReadability * 0.30 +
        finalCTA * 0.15 +
        finalEmotion * 0.10 +
        finalHashtag * 0.10
      );
    } else if (platform === 'instagram') {
      // Instagram rewards emotional visual energy, community tags, & saves
      engagementScore = Math.round(
        finalEmotion * 0.30 +
        finalHook * 0.25 +
        finalHashtag * 0.20 +
        finalCTA * 0.15 +
        finalReadability * 0.10
      );
    } else { // Facebook
      engagementScore = Math.round(
        finalEmotion * 0.35 +
        finalHook * 0.25 +
        finalCTA * 0.20 +
        finalReadability * 0.15 +
        finalHashtag * 0.05
      );
    }

    engagementScore = Math.max(15, Math.min(99, engagementScore));

    if (suggestions.length === 0) {
      suggestions.push('Post is strongly optimized! Test posting at peak algorithm hours for best reach.');
    }

    return {
      engagementScore,
      breakdown: {
        hookStrength: { score: finalHook, reasoning: hookReason },
        emotionalResonance: { score: finalEmotion, reasoning: emotionReason },
        ctaClarity: { score: finalCTA, reasoning: ctaReason },
        readability: { score: finalReadability, reasoning: readabilityReason },
        hashtagEffectiveness: { score: finalHashtag, reasoning: hashtagReason },
      },
      sentiment,
      suggestions: suggestions.slice(0, 4),
      platformSpecific: {
        optimalLength,
        currentLength: charCount,
        lengthVerdict: charCount < optimalLength * 0.5 ? 'too_short' : charCount > optimalLength * 1.5 ? 'too_long' : 'optimal',
        hashtagRecommendations:
          platform === 'twitter'
            ? ['#Tech', '#Growth']
            : platform === 'linkedin'
            ? ['#SaaS', '#B2BGrowth', '#Leadership', '#Marketing']
            : platform === 'instagram'
            ? ['#ContentCreator', '#SaaSStartup', '#GrowthHacking', '#ViralReels', '#MarketingStrategy']
            : ['#Innovation', '#SmallBiz'],
        bestPostingTimes,
        contentFormatSuggestion: formatSuggestion,
      },
    };
  }
}
