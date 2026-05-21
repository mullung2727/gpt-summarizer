import { Redis } from "@upstash/redis";

export interface SummaryItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  createdAt: string;
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const KEY = "summaries";

// Redis에 "summaries" 키로 SummaryItem[] 배열 전체를 JSON으로 저장
export async function getSummaries(): Promise<SummaryItem[]> {
  return (await redis.get<SummaryItem[]>(KEY)) ?? [];
}

export async function saveSummaries(items: SummaryItem[]): Promise<void> {
  await redis.set(KEY, items);
}
