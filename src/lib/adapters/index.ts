import { PlatformAdapter } from "./types";
import { LeetCodeAdapter } from "./leetcode";
import { CodeforcesAdapter } from "./codeforces";
import { CodeChefAdapter } from "./codechef";
import { Platform } from "@prisma/client";

export const adapters: Record<Platform, PlatformAdapter | null> = {
  [Platform.LEETCODE]: new LeetCodeAdapter(),
  [Platform.CODEFORCES]: new CodeforcesAdapter(),
  [Platform.CODECHEF]: new CodeChefAdapter(),
  [Platform.GEEKSFORGEEKS]: null,
  [Platform.HACKERRANK]: null,
  [Platform.NEETCODE]: null,
};

export function getAdapter(platform: Platform): PlatformAdapter | null {
  return adapters[platform] || null;
}
