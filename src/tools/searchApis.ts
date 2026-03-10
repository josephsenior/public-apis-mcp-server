import Fuse from "fuse.js";
import { z } from "zod";
import { apiCache } from "../cache/apiCache.js";
import type { PublicAPI } from "../types/index.js";

export const searchApisSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  auth: z.enum(["No", "apiKey", "OAuth"]).optional(),
  httpsOnly: z.boolean().optional().default(true),
  limit: z.number().min(1).max(20).optional().default(5),
});

export type SearchApisInput = z.infer<typeof searchApisSchema>;

export async function searchApis(input: SearchApisInput): Promise<PublicAPI[]> {
  let apis = await apiCache.getApis();

  // Apply hard filters
  if (input.auth) {
    apis = apis.filter((a) => a.auth === input.auth);
  }
  if (input.httpsOnly) {
    apis = apis.filter((a) => a.https);
  }
  if (input.category) {
    const cat = input.category.toLowerCase();
    apis = apis.filter((a) => a.category.toLowerCase() === cat);
  }

  // Fuzzy search if query is provided
  if (input.query) {
    const fuse = new Fuse(apis, {
      keys: ["name", "description"],
      threshold: 0.4,
    });
    const results = fuse.search(input.query);
    return results.slice(0, input.limit).map((r) => r.item);
  }

  return apis.slice(0, input.limit);
}
