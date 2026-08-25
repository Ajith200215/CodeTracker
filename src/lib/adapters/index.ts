import { PlatformAdapter } from "./types";
import { LeetCodeAdapter } from "./leetcode";
import { CodeforcesAdapter } from "./codeforces";
import { CodeChefAdapter } from "./codechef";
import { HackerRankAdapter } from "./hackerrank";
import { GeeksForGeeksAdapter } from "./geeksforgeeks";
import { Platform } from "@prisma/client";

export const adapters: Record<Platform, PlatformAdapter | null> = {
  [Platform.LEETCODE]: new LeetCodeAdapter(),
  [Platform.CODEFORCES]: new CodeforcesAdapter(),
  [Platform.CODECHEF]: new CodeChefAdapter(),
  [Platform.GEEKSFORGEEKS]: new GeeksForGeeksAdapter(),
  [Platform.HACKERRANK]: new HackerRankAdapter(),
  [Platform.NEETCODE]: null,
};

export function getAdapter(platform: Platform): PlatformAdapter | null {
  return adapters[platform] || null;
}
