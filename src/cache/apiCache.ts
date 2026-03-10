import NodeCache from "node-cache";
import type { PublicAPI } from "../types/index.js";
import { fetchReadme } from "../data/fetcher.js";
import { parseReadme } from "../data/parser.js";

const CACHE_KEY = "public-apis";
const TTL_SECONDS = 24 * 60 * 60; // 24 hours

class ApiCache {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: TTL_SECONDS });
  }

  async getApis(): Promise<PublicAPI[]> {
    const cached = this.cache.get<PublicAPI[]>(CACHE_KEY);
    if (cached) return cached;

    const markdown = await fetchReadme();
    const apis = parseReadme(markdown);

    if (apis.length === 0) {
      throw new Error(
        "Failed to parse any APIs from the public-apis README. The format may have changed."
      );
    }

    this.cache.set(CACHE_KEY, apis);
    return apis;
  }

  async getCategories(): Promise<string[]> {
    const apis = await this.getApis();
    const categories = new Set(apis.map((api) => api.category));
    return Array.from(categories).sort();
  }
}

export const apiCache = new ApiCache();
