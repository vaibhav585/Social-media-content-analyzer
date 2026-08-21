// =============================================================================
// Constants
// Platform configs, score thresholds, and other static data.
// =============================================================================

import type { Platform } from '../types';
import { FaInstagram, FaLinkedin, FaTwitter, FaFacebook } from 'react-icons/fa';
import React from 'react';

// ── Platform Configuration ───────────────────────────────────────────────────

export interface PlatformConfig {
  name: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  optimalLength: { min: number; max: number };
  maxHashtags: number;
  bestTimes: string[];
  contentFormats: string[];
}

export const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  instagram: {
    name: 'Instagram',
    icon: FaInstagram,
    color: '#E4405F',
    gradient: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    optimalLength: { min: 138, max: 150 },
    maxHashtags: 30,
    bestTimes: ['11:00 AM', '1:00 PM', '5:00 PM'],
    contentFormats: ['Carousel', 'Reel', 'Static Image', 'Story'],
  },
  linkedin: {
    name: 'LinkedIn',
    icon: FaLinkedin,
    color: '#0A66C2',
    gradient: 'linear-gradient(135deg, #0A66C2, #004182)',
    optimalLength: { min: 1300, max: 2000 },
    maxHashtags: 5,
    bestTimes: ['8:00 AM', '12:00 PM', '5:00 PM'],
    contentFormats: ['Text Post', 'Article', 'Carousel', 'Document'],
  },
  twitter: {
    name: 'Twitter / X',
    icon: FaTwitter,
    color: '#1DA1F2',
    gradient: 'linear-gradient(135deg, #1DA1F2, #0d8ed9)',
    optimalLength: { min: 71, max: 100 },
    maxHashtags: 2,
    bestTimes: ['9:00 AM', '12:00 PM', '5:00 PM'],
    contentFormats: ['Thread', 'Single Tweet', 'Quote Tweet', 'Poll'],
  },
  facebook: {
    name: 'Facebook',
    icon: FaFacebook,
    color: '#1877F2',
    gradient: 'linear-gradient(135deg, #1877F2, #0c56b3)',
    optimalLength: { min: 40, max: 80 },
    maxHashtags: 2,
    bestTimes: ['9:00 AM', '1:00 PM', '3:00 PM'],
    contentFormats: ['Status Update', 'Photo Post', 'Video', 'Live'],
  },
};

// ── Score Thresholds ─────────────────────────────────────────────────────────

export const SCORE_THRESHOLDS = {
  excellent: { min: 80, label: 'Excellent', color: '#10b981' },
  good: { min: 60, label: 'Good', color: '#3b82f6' },
  average: { min: 40, label: 'Average', color: '#f59e0b' },
  poor: { min: 20, label: 'Needs Work', color: '#f97316' },
  veryPoor: { min: 0, label: 'Poor', color: '#ef4444' },
} as const;

export function getScoreInfo(score: number) {
  if (score >= SCORE_THRESHOLDS.excellent.min) return SCORE_THRESHOLDS.excellent;
  if (score >= SCORE_THRESHOLDS.good.min) return SCORE_THRESHOLDS.good;
  if (score >= SCORE_THRESHOLDS.average.min) return SCORE_THRESHOLDS.average;
  if (score >= SCORE_THRESHOLDS.poor.min) return SCORE_THRESHOLDS.poor;
  return SCORE_THRESHOLDS.veryPoor;
}

// ── Sentiment Colors ─────────────────────────────────────────────────────────

export const SENTIMENT_CONFIG = {
  positive: { label: 'Positive', color: '#10b981', icon: '😊' },
  negative: { label: 'Negative', color: '#ef4444', icon: '😟' },
  neutral: { label: 'Neutral', color: '#6b7280', icon: '😐' },
  mixed: { label: 'Mixed', color: '#8b5cf6', icon: '🤔' },
} as const;

// ── File Upload Constraints ──────────────────────────────────────────────────

export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10 MB
  acceptedTypes: {
    'application/pdf': ['.pdf'],
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/webp': ['.webp'],
  },
  maxTextLength: 10000,
};

// ── Breakdown Categories ─────────────────────────────────────────────────────

import { Anchor, Heart, Megaphone, BookOpen, Hash } from 'lucide-react';

export const BREAKDOWN_CATEGORIES = [
  { key: 'hookStrength', label: 'Hook Strength', icon: Anchor, description: 'How well the opening grabs attention' },
  { key: 'emotionalResonance', label: 'Emotional Resonance', icon: Heart, description: 'Emotional impact and connection' },
  { key: 'ctaClarity', label: 'CTA Clarity', icon: Megaphone, description: 'Clear call-to-action effectiveness' },
  { key: 'readability', label: 'Readability', icon: BookOpen, description: 'Ease of reading and comprehension' },
  { key: 'hashtagEffectiveness', label: 'Hashtag Strategy', icon: Hash, description: 'Hashtag relevance and optimization' },
] as const;
