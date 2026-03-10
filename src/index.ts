#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { searchApis, searchApisSchema } from "./tools/searchApis.js";
import { getCategories, getCategoriesSchema } from "./tools/getCategories.js";
import { getApiDetail, getApiDetailSchema } from "./tools/getApiDetail.js";
import { probeApi, probeApiSchema } from "./tools/probeApi.js";
import { compareApis, compareApisSchema } from "./tools/compareApis.js";
import {
  findNoAuthApis,
  findNoAuthApisSchema,
} from "./tools/findNoAuthApis.js";
import {
  generateSnippet,
  generateSnippetSchema,
} from "./tools/generateSnippet.js";

const server = new Server(
  { name: "mcp-public-apis", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_apis",
      description:
        "Search the public-apis list by keyword, category, auth type, and HTTPS support.",
      inputSchema: {
        type: "object" as const,
        properties: {
          query: { type: "string", description: "Fuzzy search keyword" },
          category: { type: "string", description: "Filter by category name" },
          auth: {
            type: "string",
            enum: ["No", "apiKey", "OAuth"],
            description: "Filter by auth type",
          },
          httpsOnly: {
            type: "boolean",
            description: "Only return HTTPS APIs (default: true)",
          },
          limit: {
            type: "number",
            description: "Max results to return (1-20, default: 5)",
          },
        },
      },
    },
    {
      name: "get_categories",
      description:
        "Returns all available API categories with the number of APIs in each.",
      inputSchema: { type: "object" as const, properties: {} },
    },
    {
      name: "get_api_detail",
      description: "Get full details about a specific API by name.",
      inputSchema: {
        type: "object" as const,
        properties: {
          name: { type: "string", description: "API name to look up" },
        },
        required: ["name"],
      },
    },
    {
      name: "probe_api",
      description:
        "Makes a safe live HTTP GET request to a given API endpoint and returns the response status, shape, and latency.",
      inputSchema: {
        type: "object" as const,
        properties: {
          url: { type: "string", description: "The API endpoint URL to probe" },
          apiKey: {
            type: "string",
            description: "Optional API key to include",
          },
          apiKeyParam: {
            type: "string",
            description:
              'Query parameter name for the API key (default: "api_key")',
          },
          timeoutMs: {
            type: "number",
            description: "Request timeout in ms (default: 5000)",
          },
        },
        required: ["url"],
      },
    },
    {
      name: "compare_apis",
      description:
        "Compare all APIs within a category side by side, with a summary of auth and HTTPS support.",
      inputSchema: {
        type: "object" as const,
        properties: {
          category: {
            type: "string",
            description: "Category name to compare",
          },
          limit: {
            type: "number",
            description: "Max APIs to compare (2-10, default: 5)",
          },
        },
        required: ["category"],
      },
    },
    {
      name: "find_no_auth_apis",
      description:
        "Returns APIs that require zero authentication, optionally filtered by category.",
      inputSchema: {
        type: "object" as const,
        properties: {
          category: {
            type: "string",
            description: "Optional category filter",
          },
          httpsOnly: {
            type: "boolean",
            description: "Only return HTTPS APIs (default: true)",
          },
          limit: {
            type: "number",
            description: "Max results (1-20, default: 10)",
          },
        },
      },
    },
    {
      name: "generate_snippet",
      description:
        "Generates ready-to-use curl, fetch, and axios code snippets for calling a given API endpoint.",
      inputSchema: {
        type: "object" as const,
        properties: {
          url: { type: "string", description: "The API endpoint URL" },
          apiKey: {
            type: "string",
            description: "Optional API key to include",
          },
          apiKeyParam: {
            type: "string",
            description:
              'Query parameter name for the API key (default: "api_key")',
          },
          headers: {
            type: "object",
            description: "Additional headers as key-value pairs",
            additionalProperties: { type: "string" },
          },
        },
        required: ["url"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_apis": {
        const input = searchApisSchema.parse(args);
        const result = await searchApis(input);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "get_categories": {
        getCategoriesSchema.parse(args);
        const result = await getCategories();
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "get_api_detail": {
        const input = getApiDetailSchema.parse(args);
        const result = await getApiDetail(input);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "probe_api": {
        const input = probeApiSchema.parse(args);
        const result = await probeApi(input);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "compare_apis": {
        const input = compareApisSchema.parse(args);
        const result = await compareApis(input);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "find_no_auth_apis": {
        const input = findNoAuthApisSchema.parse(args);
        const result = await findNoAuthApis(input);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      case "generate_snippet": {
        const input = generateSnippetSchema.parse(args);
        const result = generateSnippet(input);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      default:
        return {
          content: [{ type: "text", text: JSON.stringify({ error: `Unknown tool: ${name}` }) }],
          isError: true,
        };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: JSON.stringify({ error: message }) }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
