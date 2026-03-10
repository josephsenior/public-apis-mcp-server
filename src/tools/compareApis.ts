import { z } from "zod";
import { apiCache } from "../cache/apiCache.js";
import type { PublicAPI } from "../types/index.js";

export const compareApisSchema = z.object({
  category: z.string(),
  limit: z.number().min(2).max(10).optional().default(5),
});

export type CompareApisInput = z.infer<typeof compareApisSchema>;

interface CompareResult {
  category: string;
  apis: PublicAPI[];
  summary: {
    total: number;
    noAuthCount: number;
    httpsCount: number;
    corsCount: number;
  };
}

export async function compareApis(
  input: CompareApisInput
): Promise<CompareResult | { error: string }> {
  const allApis = await apiCache.getApis();
  const cat = input.category.toLowerCase();
  const filtered = allApis.filter((a) => a.category.toLowerCase() === cat);

  if (filtered.length === 0) {
    return { error: `No APIs found in category "${input.category}"` };
  }

  const apis = filtered.slice(0, input.limit);

  return {
    category: filtered[0].category,
    apis,
    summary: {
      total: filtered.length,
      noAuthCount: filtered.filter((a) => a.auth === "No").length,
      httpsCount: filtered.filter((a) => a.https).length,
      corsCount: filtered.filter((a) => a.cors === "Yes").length,
    },
  };
}
