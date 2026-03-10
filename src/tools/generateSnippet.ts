import { z } from "zod";
import type { SnippetResult } from "../types/index.js";

export const generateSnippetSchema = z.object({
  url: z.string().url(),
  apiKey: z.string().optional(),
  apiKeyParam: z.string().optional().default("api_key"),
  headers: z.record(z.string()).optional(),
});

export type GenerateSnippetInput = z.infer<typeof generateSnippetSchema>;

export function generateSnippet(input: GenerateSnippetInput): SnippetResult {
  const hasKey = !!input.apiKey;

  const fullUrl = hasKey
    ? `${input.url}?${input.apiKeyParam}=${input.apiKey}`
    : input.url;

  const allHeaders: Record<string, string> = {
    Accept: "application/json",
    ...input.headers,
  };

  // --- curl ---
  const curlHeaders = Object.entries(allHeaders)
    .map(([k, v]) => `  -H "${k}: ${v}"`)
    .join(" \\\n");
  const curl = `curl -X GET "${fullUrl}" \\\n${curlHeaders}`;

  // --- fetch ---
  const fetchHeaders = JSON.stringify(allHeaders, null, 4);
  const fetch = [
    `const response = await fetch("${fullUrl}", {`,
    `  headers: ${fetchHeaders.replace(/\n/g, "\n  ")}`,
    `});`,
    `const data = await response.json();`,
    `console.log(data);`,
  ].join("\n");

  // --- axios ---
  const axiosParams = hasKey
    ? `\n  params: { ${input.apiKeyParam}: "${input.apiKey}" },`
    : "";
  const axiosHeaders = JSON.stringify(allHeaders, null, 4);
  const axiosSnippet = [
    `import axios from "axios";`,
    ``,
    `const { data } = await axios.get("${input.url}", {${axiosParams}`,
    `  headers: ${axiosHeaders.replace(/\n/g, "\n  ")}`,
    `});`,
    `console.log(data);`,
  ].join("\n");

  return { curl, fetch, axios: axiosSnippet };
}
