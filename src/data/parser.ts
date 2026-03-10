import type { PublicAPI } from "../types/index.js";

export function parseReadme(markdown: string): PublicAPI[] {
  const apis: PublicAPI[] = [];
  const lines = markdown.split("\n");

  let currentCategory = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect category headings (## or ###)
    const headingMatch = line.match(/^#{2,3}\s+(.+)$/);
    if (headingMatch) {
      const heading = headingMatch[1].trim();
      // Skip non-category headings like "Index", "Contributing", etc.
      if (
        heading !== "Index" &&
        heading !== "Contributing" &&
        heading !== "License" &&
        heading !== "Public APIs"
      ) {
        currentCategory = heading;
      }
      continue;
    }

    // Skip if we're not inside a category yet
    if (!currentCategory) continue;

    // Skip table separator rows and header rows
    if (line.startsWith("|---") || line.startsWith("| API")) continue;
    if (line.includes("|---")) continue;

    // Parse table rows
    if (line.startsWith("|") && line.includes("[")) {
      const entry = parseTableRow(line, currentCategory);
      if (entry) {
        apis.push(entry);
      }
    }
  }

  return apis;
}

function parseTableRow(row: string, category: string): PublicAPI | null {
  // Split by | and trim each cell
  const cells = row
    .split("|")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  if (cells.length < 5) return null;

  // Extract name and link from markdown link syntax [Name](url)
  const linkMatch = cells[0].match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (!linkMatch) return null;

  const name = linkMatch[1].trim();
  const link = linkMatch[2].trim();
  const description = cells[1].trim();

  // Normalize auth field
  const rawAuth = cells[2].trim().replace(/`/g, "");
  let auth: string;
  if (rawAuth.toLowerCase() === "no" || rawAuth === "") {
    auth = "No";
  } else if (rawAuth.toLowerCase().includes("oauth")) {
    auth = "OAuth";
  } else if (rawAuth.toLowerCase().includes("apikey") || rawAuth.toLowerCase().includes("api key")) {
    auth = "apiKey";
  } else {
    auth = rawAuth;
  }

  // HTTPS: "Yes" → true, anything else → false
  const https = cells[3].trim().toLowerCase() === "yes";

  // CORS: keep as-is, default to "Unknown"
  const rawCors = cells[4].trim();
  let cors: "Yes" | "No" | "Unknown";
  if (rawCors.toLowerCase() === "yes") {
    cors = "Yes";
  } else if (rawCors.toLowerCase() === "no") {
    cors = "No";
  } else {
    cors = "Unknown";
  }

  return { name, description, auth, https, cors, link, category };
}
