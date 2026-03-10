import { z } from "zod";
import { apiCache } from "../cache/apiCache.js";
import type { PublicAPI } from "../types/index.js";

export const getApiDetailSchema = z.object({
  name: z.string(),
});

export type GetApiDetailInput = z.infer<typeof getApiDetailSchema>;

export async function getApiDetail(
  input: GetApiDetailInput
): Promise<PublicAPI | { error: string }> {
  const apis = await apiCache.getApis();
  const query = input.name.toLowerCase();

  const exact = apis.find((a) => a.name.toLowerCase() === query);
  if (exact) return exact;

  const partial = apis.find((a) => a.name.toLowerCase().includes(query));
  if (partial) return partial;

  return { error: `No API found matching "${input.name}"` };
}
