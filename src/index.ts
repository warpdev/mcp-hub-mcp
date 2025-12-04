#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { McpServerManager } from "./server-manager.js";

// Create MCP server manager instance (auto load enabled)
const serverManager = new McpServerManager({
  autoLoad: true,
});

// Create MCP server
const server = new McpServer({
  name: "MCP-Hub-Server",
  version: "1.0.0",
  title: "MCP Hub",
});

// Tool to return tools list from all servers
server.registerTool(
  "list-all-tools",
  {
    title: "List All Tools",
    description: "List ALL available tools from all connected servers. NOTE: For better performance, use find-tools with keywords first. Only use this when you need to see everything or if find-tools didn't find what you need",
    inputSchema: {},
  },
  async () => {
    try {
      const servers = serverManager.getConnectedServers();

      if (servers.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No connected servers.",
            },
          ],
        };
      }

      const allTools: Record<string, any> = {};

      // Get tools list from each server
      for (const serverName of servers) {
        try {
          const toolsResponse = await serverManager.listTools(serverName);
          
          // Filter to only include name and description
          if (toolsResponse.tools && Array.isArray(toolsResponse.tools)) {
            allTools[serverName] = {
              tools: toolsResponse.tools.map((tool: any) => ({
                name: tool.name,
                description: tool.description,
              }))
            };
          } else {
            allTools[serverName] = toolsResponse;
          }
        } catch (error) {
          allTools[serverName] = {
            error: `Failed to get tools list: ${(error as Error).message}`,
          };
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(allTools, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to get tools list from all servers: ${
              (error as Error).message
            }`,
          },
        ],
        isError: true,
      };
    }
  },
);

// Tool to call a specific tool from a specific server
server.registerTool(
  "call-tool",
  {
    title: "Call Tool",
    description: "Call a specific tool from a specific server. TIP: Use find-tools first to discover the tool and get the correct serverName and toolName",
    inputSchema: {
      serverName: z.string().describe("Name of the MCP server to call tool from"),
      toolName: z.string().describe("Name of the tool to call"),
      toolArgs: z.record(z.unknown()).describe("Arguments to pass to the tool"),
    },
  },
  async ({ serverName, toolName, toolArgs }) => {
    try {
      const result = await serverManager.callTool(
        serverName,
        toolName,
        toolArgs,
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Tool call failed: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  },
);

// Tool to find tools matching a pattern across all servers
server.registerTool(
  "find-tools",
  {
    title: "Find Tools",
    description: "Use this tool to find best tools by searching with keywords or regex patterns. If you don't have a specific tool for a task, this is the best way to discover what tools are available.",
    inputSchema: {
      pattern: z.string().describe("Regex pattern to search for in tool names and descriptions"),
      searchIn: z.enum(["name", "description", "both"]).optional().default("both").describe("Where to search: in tool names, descriptions, or both"),
      caseSensitive: z.boolean().optional().default(false).describe("Whether the search should be case-sensitive"),
    },
  },
  async ({ pattern, searchIn, caseSensitive }) => {
    try {
      const results = await serverManager.findTools(pattern, {
        searchIn,
        caseSensitive,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to find tools: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  },
);

// Tool to get detailed information about a specific tool
server.registerTool(
  "get-tool",
  {
    title: "Get Tool Schema",
    description: "Get complete schema for a specific tool from a specific server, including inputSchema. TIP: Use find-tools first to discover the tool and get the correct serverName and toolName",
    inputSchema: {
      serverName: z.string().describe("Name of the MCP server containing the tool"),
      toolName: z.string().describe("Exact name of the tool to retrieve"),
    },
  },
  async ({ serverName, toolName }) => {
    try {
      const tool = await serverManager.getTool(serverName, toolName);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(tool, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting tool: ${(error as Error).message}`,
          },
        ],
      };
    }
  }
);

// Tool to list all tools from a specific server
server.registerTool(
  "list-all-tools-in-server",
  {
    title: "List Tools in Server",
    description: "List ALL tools from a specific MCP server (returns name and description only)",
    inputSchema: {
      serverName: z.string().describe("Name of the MCP server to list tools from"),
    },
  },
  async ({ serverName }) => {
    try {
      const result = await serverManager.listToolsInServer(serverName);

      return {
        content: [
          {
            type: "text", 
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error listing tools from server '${serverName}': ${(error as Error).message}`,
          },
        ],
      };
    }
  }
);

// Tool to find tools in a specific server
server.registerTool(
  "find-tools-in-server",
  {
    title: "Find Tools in Server",
    description: "Find tools matching a pattern in a specific MCP server (returns name and description only)",
    inputSchema: {
      serverName: z.string().describe("Name of the MCP server to search tools in"),
      pattern: z.string().describe("Regex pattern to search for in tool names and descriptions"),
      searchIn: z.enum(["name", "description", "both"]).default("both").describe("Where to search: in tool names, descriptions, or both"),
      caseSensitive: z.boolean().default(false).describe("Whether the search should be case-sensitive"),
    },
  },
  async ({ serverName, pattern, searchIn, caseSensitive }) => {
    try {
      const results = await serverManager.findToolsInServer(
        serverName,
        pattern,
        searchIn,
        caseSensitive
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ tools: results }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error finding tools in server '${serverName}': ${(error as Error).message}`,
          },
        ],
      };
    }
  }
);

// Tool to list all connected servers
server.registerTool(
  "list-servers",
  {
    title: "List Servers",
    description: "List all connected MCP servers",
    inputSchema: {},
  },
  async () => {
    try {
      const servers = serverManager.listServers();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ servers }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error listing servers: ${(error as Error).message}`,
          },
        ],
      };
    }
  }
);

// Start server
async function startServer() {
  try {
    // Communication through standard input/output
    const transport = new StdioServerTransport();
    await server.connect(transport);

    // Disconnect all connections on process termination
    process.on("SIGINT", async () => {
      console.log("Shutting down server...");
      await serverManager.disconnectAll();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
