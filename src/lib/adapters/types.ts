import { Platform } from "@prisma/client";

export interface PlatformStatsResult {
  totalSolved: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  rating?: number;
  maxRating?: number;
  rank?: string;
  stars?: string;
  raw: unknown;
}

export interface PlatformAdapter {
  platform: Platform;
  fetchStats(username: string): Promise<PlatformStatsResult>;
}
