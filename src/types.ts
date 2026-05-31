/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Rank = '인턴' | '사원' | '대리' | '과장' | 'CEO';

export interface TOEICWord {
  id: number;
  category: string;
  rank_level: Rank;
  word: string;
  meaning: string;
  collocation: string;
  example_en: string;
  example_ko: string;
}

export interface UserProfile {
  userId: string;
  currentRank: Rank;
  totalXP: number;
  heartCount: number;
  lastCheckedIn: string; // ISO date string or date label
  dailyCompletedCount: number; // number of vocabulary studied today
  quizCount: number; // total quizzes taken
  rebirthCount?: number; // Number of careers reincarnated as prestige
}

export interface IncorrectWord {
  wordId: number;
  addedAt: string;
  wrongCount: number;
  reviewCount: number;
}

export interface RankInfo {
  title: Rank;
  nextTitle: Rank | null;
  xpRequired: number;
  unlockedCategories: string[];
  color: string;
  bgGrad: string;
  avatar: string; // emoji or design placeholder
  quote: string; // Fun motivation quote
}
