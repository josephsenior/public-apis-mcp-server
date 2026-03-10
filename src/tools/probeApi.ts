import axios from "axios";
import { z } from "zod";
import type { ProbeResult } from "../types/index.js";

export const probeApiSchema = z.object({
  url: z.string().url(),
  apiKey: z.string().optional(),
  apiKeyParam: z.string().optional().default("api_key"),
  timeoutMs: z.number().optional().default(5000),
});

export type ProbeApiInput = z.infer<typeof probeApiSchema>;

export async function probeApi(input: ProbeApiInput): Promise<ProbeResult> {
  let targetUrl = input.url;

  if (input.apiKey) {
    const separator = targetUrl.includes("?") ? "&" : "?";
    targetUrl += `${separator}${encodeURIComponent(input.apiKeyParam)}=${encodeURIComponent(input.apiKey)}`;
  }

  const start = Date.now();

  try {
    const response = await axios.get(targetUrl, {
      timeout: input.timeoutMs,
      maxRedirects: 2,
      headers: {
        "User-Agent": "mcp-public-apis/1.0",
        Accept: "application/json",
      },
      validateStatus: () => true,
    });

    const elapsed = Date.now() - start;
    const contentType =
      (response.headers["content-type"] as string) ?? "unknown";

    let bodyPreview: unknown;
    if (typeof response.data === "string") {
      bodyPreview = response.data.slice(0, 500);
    } else {
      const serialized = JSON.stringify(response.data);
      bodyPreview = serialized.length > 500 ? serialized.slice(0, 500) + "…" : response.data;
    }

    return {
      url: input.url,
      status: response.status,
      responseTimeMs: elapsed,
      contentType,
      bodyPreview,
    };
  } catch (err) {
    const elapsed = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    return {
      url: input.url,
      status: 0,
      responseTimeMs: elapsed,
      contentType: "unknown",
      bodyPreview: null,
      error: message,
    };
  }
}
