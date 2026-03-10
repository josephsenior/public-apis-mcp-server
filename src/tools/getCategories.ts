import { z } from "zod";
import { apiCache } from "../cache/apiCache.js";

export const getCategoriesSchema = z.object({});

export async function getCategories(): Promise<
  { category: string; count: number }[]
> {
  const apis = await apiCache.getApis();
  const counts = new Map<string, number>();

  for (const api of apis) {
    counts.set(api.category, (counts.get(api.category) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => a.category.localeCompare(b.category));
}
