import { z } from "zod";
import { apiCache } from "../cache/apiCache.js";
import type { PublicAPI } from "../types/index.js";

export const findNoAuthApisSchema = z.object({
  category: z.string().optional(),
  httpsOnly: z.boolean().optional().default(true),
  limit: z.number().min(1).max(20).optional().default(10),
});

export type FindNoAuthApisInput = z.infer<typeof findNoAuthApisSchema>;

export async function findNoAuthApis(
  input: FindNoAuthApisInput
): Promise<PublicAPI[]> {
  let apis = await apiCache.getApis();

  apis = apis.filter((a) => a.auth === "No");

  if (input.category) {
    const cat = input.category.toLowerCase();
    apis = apis.filter((a) => a.category.toLowerCase() === cat);
  }

  if (input.httpsOnly) {
    apis = apis.filter((a) => a.https);
  }

  return apis.slice(0, input.limit);
}
