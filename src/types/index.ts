export interface PublicAPI {
  name: string;
  description: string;
  auth: "apiKey" | "OAuth" | "No" | string;
  https: boolean;
  cors: "Yes" | "No" | "Unknown";
  link: string;
  category: string;
}

export interface ProbeResult {
  url: string;
  status: number;
  responseTimeMs: number;
  contentType: string;
  bodyPreview: unknown;
  error?: string;
}

export interface SnippetResult {
  curl: string;
  fetch: string;
  axios: string;
}
