export type Platform = 'instagram' | 'linkedin' | 'twitter' | 'facebook';
export type FileType = 'pdf' | 'image' | 'text';
export interface ScoreDetail {
    score: number;
    reasoning: string;
}
export interface AnalysisBreakdown {
    hookStrength: ScoreDetail;
    emotionalResonance: ScoreDetail;
    ctaClarity: ScoreDetail;
    readability: ScoreDetail;
    hashtagEffectiveness: ScoreDetail;
}
export type Sentiment = 'positive' | 'negative' | 'neutral' | 'mixed';
export interface PlatformSpecific {
    optimalLength: number;
    currentLength: number;
    lengthVerdict: 'too_short' | 'optimal' | 'too_long';
    hashtagRecommendations: string[];
    bestPostingTimes: string[];
    contentFormatSuggestion: string;
}
export interface AnalysisResult {
    engagementScore: number;
    breakdown: AnalysisBreakdown;
    sentiment: Sentiment;
    suggestions: string[];
    platformSpecific: PlatformSpecific;
}
export interface Analysis {
    id: string;
    userId: string;
    originalText: string;
    fileName: string | null;
    fileType: FileType | null;
    fileUrl: string | null;
    platform: Platform;
    engagementScore: number;
    breakdown: AnalysisBreakdown;
    sentiment: Sentiment;
    suggestions: string[];
    platformTips: PlatformSpecific;
    visualAnalysis: Record<string, unknown>;
    aiProvider: string;
    processingTimeMs: number;
    createdAt: string;
}
export type RewriteGoal = 'max_reach' | 'max_engagement' | 'professional';
export interface RewriteVariant {
    goal: RewriteGoal;
    rewrittenText: string;
    improvementNotes: string;
}
export interface Rewrite {
    id: string;
    analysisId: string;
    userId: string;
    goal: RewriteGoal;
    rewrittenText: string;
    improvementNotes: string;
    aiProvider: string;
    createdAt: string;
}
export interface BenchmarkComparison {
    userScore: number;
    competitorScore: number;
    userBreakdown: AnalysisBreakdown;
    competitorBreakdown: AnalysisBreakdown;
    whatTheyDidBetter: string[];
    yourStrengths: string[];
}
export interface Benchmark {
    id: string;
    userId: string;
    userAnalysisId: string;
    competitorText: string;
    competitorScore: number;
    comparison: BenchmarkComparison;
    createdAt: string;
}
export interface AnalyzeRequest {
    text: string;
    fileType: FileType;
    platform: Platform;
    fileUrl?: string;
}
export interface AnalyzeResponse {
    analysis: Analysis;
}
export interface RewriteRequest {
    analysisId: string;
    text: string;
    goal: RewriteGoal;
    platform: Platform;
}
export interface RewriteResponse {
    variants: RewriteVariant[];
}
export interface BenchmarkRequest {
    analysisId: string;
    competitorText: string;
    platform: Platform;
}
export interface BenchmarkResponse {
    benchmark: Benchmark;
}
export interface AnalysisHistoryResponse {
    analyses: Analysis[];
    total: number;
    page: number;
    limit: number;
}
export interface TrendDataPoint {
    date: string;
    score: number;
    platform: Platform;
}
export interface TrendsResponse {
    trends: TrendDataPoint[];
    averageByPlatform: Record<Platform, number>;
}
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
export interface ProviderHealth {
    name: string;
    circuitState: CircuitState;
    requestsThisMinute: number;
    requestsToday: number;
    isAvailable: boolean;
}
export interface HealthResponse {
    status: 'ok' | 'degraded';
    uptime: number;
    providers: ProviderHealth[];
}
export interface UserProfile {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    createdAt: string;
}
export interface ApiError {
    error: string;
    message: string;
    statusCode: number;
    details?: unknown;
}
//# sourceMappingURL=types.d.ts.map