<div align="center">

# mcp-public-apis

**Give your AI coding agent the ability to find, test, and integrate any of 1,500+ free public APIs — instantly.**

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![MCP Compatible](https://img.shields.io/badge/MCP-compatible-blue.svg)](https://modelcontextprotocol.io)
[![Works with Claude](https://img.shields.io/badge/Claude-Desktop-8A4BE2?logo=anthropic)](https://claude.ai)
[![Works with Cursor](https://img.shields.io/badge/Cursor-✓-orange)](https://cursor.sh)
[![Works with Windsurf](https://img.shields.io/badge/Windsurf-✓-06B6D4)](https://codeium.com/windsurf)
[![Works with Cline](https://img.shields.io/badge/Cline-✓-F59E0B)](https://github.com/cline/cline)

Data sourced from the community-maintained [public-apis](https://github.com/public-apis/public-apis) list · synced daily

</div>

---

## What is this?

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that gives AI coding agents real-time access to the public-apis dataset. Instead of copy-pasting API documentation, your agent can search, probe, and generate working code — all in one conversation.

```
You:   "Find me a free weather API with no auth that supports HTTPS"
Agent: [calls search_apis] → returns top matches with auth/HTTPS/CORS details

You:   "Test the first one — show me what the response looks like"
Agent: [calls probe_api] → live GET request, returns status + response shape

You:   "Generate an axios snippet for it"
Agent: [calls generate_snippet] → ready-to-paste curl, fetch, and axios code
```

---

## Installation

Pick the config for your client and paste it in. No build step required — `npx` handles everything.

<details>
<summary><strong>Claude Desktop</strong></summary>

File: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)  
File: `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "public-apis": {
      "command": "npx",
      "args": ["mcp-public-apis"]
    }
  }
}
```

</details>

<details>
<summary><strong>Cursor</strong></summary>

File: `.cursor/mcp.json` in your project root (or `~/.cursor/mcp.json` globally)

```json
{
  "mcpServers": {
    "public-apis": {
      "command": "npx",
      "args": ["mcp-public-apis"]
    }
  }
}
```

</details>

<details>
<summary><strong>Windsurf</strong></summary>

File: `~/.codeium/windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "public-apis": {
      "command": "npx",
      "args": ["mcp-public-apis"]
    }
  }
}
```

</details>

<details>
<summary><strong>Cline (VS Code)</strong></summary>

Open VS Code → Cline sidebar → **MCP Servers** tab → **Add Server** → paste:

```json
{
  "public-apis": {
    "command": "npx",
    "args": ["mcp-public-apis"]
  }
}
```

</details>

<details>
<summary><strong>Local build</strong></summary>

```bash
git clone https://github.com/josephsenior/pblic-apis-mcp-server
cd pblic-apis-mcp-server
npm install
npm run build
node dist/index.js
```

</details>

---

## Tools

| Tool | What it does | Key parameters |
|---|---|---|
| `search_apis` | Fuzzy-search 1,500+ APIs by keyword, category, auth type, and HTTPS | `query`, `category`, `auth`, `httpsOnly`, `limit` |
| `get_categories` | List every category with its API count | — |
| `get_api_detail` | Full record for one API by name | `name` |
| `probe_api` | Live HTTP GET to any endpoint — returns status, latency, and response preview | `url`, `apiKey`, `timeoutMs` |
| `compare_apis` | Side-by-side view of all APIs in a category | `category`, `limit` |
| `find_no_auth_apis` | Only APIs that need zero authentication | `category`, `httpsOnly`, `limit` |
| `generate_snippet` | Paste-ready `curl`, `fetch`, and `axios` snippets | `url`, `apiKey`, `headers` |

### `search_apis` parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `query` | string | — | Fuzzy-match against API name and description |
| `category` | string | — | Exact category name (use `get_categories` to browse) |
| `auth` | `"No"` \| `"apiKey"` \| `"OAuth"` | — | Filter by auth requirement |
| `httpsOnly` | boolean | `true` | Exclude non-HTTPS APIs |
| `limit` | number | `5` | Max results (1–20) |

---

## How it works

```
MCP Client (Claude / Cursor / etc.)
        │  JSON-RPC over stdio
        ▼
  mcp-public-apis server
        │
        ├─ In-memory cache (24 h TTL)
        │
        └─ GitHub raw · public-apis/public-apis README.md
```

1. On first use the server fetches the public-apis README from GitHub, parses every Markdown table row into structured `PublicAPI` objects, and stores them in a 24-hour in-memory cache.
2. All search and filter operations run locally against that cache — no external call per query.
3. `probe_api` is the only tool that makes a request to a third-party endpoint (the one you explicitly pass in).

---

## Data source

All API records come from [public-apis/public-apis](https://github.com/public-apis/public-apis) — a community-maintained list of 1,500+ free APIs across 60+ categories. The data is fetched fresh every 24 hours.

---

## License

[MIT](LICENSE)
