export interface ScoreWeights {
  leetcodeSolved?: number;
  leetcodeEasy?: number;
  leetcodeMedium?: number;
  leetcodeHard?: number;
  leetcodeRating?: number;
  codeforcesRating?: number;
  codeforcesSolved?: number;
  codechefRating?: number;
  codechefSolved?: number;
  gfgSolved?: number;
  hackerrankSolved?: number;
  atcoderRating?: number;
  atcoderSolved?: number;
}

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  leetcodeSolved: 2.0,
  leetcodeEasy: 1.0,
  leetcodeMedium: 3.0,
  leetcodeHard: 5.0,
  leetcodeRating: 0.5,
  codeforcesRating: 1.2,
  codeforcesSolved: 2.5,
  codechefRating: 0.8,
  codechefSolved: 2.0,
  gfgSolved: 1.5,
  hackerrankSolved: 1.0,
  atcoderRating: 1.0,
  atcoderSolved: 2.0,
};

export interface PlatformStatSnapshotInput {
  platform: string;
  totalSolved: number;
  easySolved?: number | null;
  mediumSolved?: number | null;
  hardSolved?: number | null;
  rating?: number | null;
}

export function calculateCodeScore(
  snapshots: PlatformStatSnapshotInput[],
  customWeights?: ScoreWeights | null
): number {
  const weights = { ...DEFAULT_SCORE_WEIGHTS, ...(customWeights || {}) };
  let score = 0;

  for (const s of snapshots) {
    const p = s.platform.toUpperCase();
    if (p === "LEETCODE") {
      score += (s.totalSolved || 0) * (weights.leetcodeSolved || 0);
      score += (s.easySolved || 0) * (weights.leetcodeEasy || 0);
      score += (s.mediumSolved || 0) * (weights.leetcodeMedium || 0);
      score += (s.hardSolved || 0) * (weights.leetcodeHard || 0);
      score += (s.rating || 0) * (weights.leetcodeRating || 0);
    } else if (p === "CODEFORCES") {
      score += (s.totalSolved || 0) * (weights.codeforcesSolved || 0);
      score += (s.rating || 0) * (weights.codeforcesRating || 0);
    } else if (p === "CODECHEF") {
      score += (s.totalSolved || 0) * (weights.codechefSolved || 0);
      score += (s.rating || 0) * (weights.codechefRating || 0);
    } else if (p === "GEEKSFORGEEKS") {
      score += (s.totalSolved || 0) * (weights.gfgSolved || 0);
    } else if (p === "HACKERRANK") {
      score += (s.totalSolved || 0) * (weights.hackerrankSolved || 0);
    } else if (p === "ATCODER") {
      score += (s.totalSolved || 0) * (weights.atcoderSolved || 0);
      score += (s.rating || 0) * (weights.atcoderRating || 0);
    }
  }

  return Math.round(score);
}
