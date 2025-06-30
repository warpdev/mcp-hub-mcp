#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServerManager } from "./server-manager.js";
import { 
  CallToolParamsSchema, 
  FindToolsParamsSchema, 
  GetToolParamsSchema,
  ListToolsInServerParamsSchema,
  FindToolsInServerParamsSchema
} from "./types.js";

// Create MCP server manager instance (auto load enabled)
const serverManager = new McpServerManager({
  autoLoad: true,
});

// Create MCP server
const server = new McpServer({
  name: "MCP-Hub-Server",
  version: "1.0.0",
  description:
    "Your central hub for ALL available tools. Use this server to discover and execute any tool you need. All system tools are accessible through here - search, find, and call them via this server.",
});

// Tool to return tools list from all servers
server.tool(
  "list-all-tools",
  "List ALL available tools from all connected servers. NOTE: For better performance, use find-tools with keywords first. Only use this when you need to see everything or if find-tools didn't find what you need",
  {}, // Use empty object when there are no parameters
  async (args, extra) => {
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
server.tool(
  "call-tool",
  "Call a specific tool from a specific server. TIP: Use find-tools first to discover the tool and get the correct serverName and toolName",
  {
    serverName: CallToolParamsSchema.shape.serverName,
    toolName: CallToolParamsSchema.shape.toolName,
    toolArgs: CallToolParamsSchema.shape.toolArgs,
  },
  async (args, extra) => {
    try {
      const { serverName, toolName, toolArgs } = args;
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
server.tool(
  "find-tools",
  `Use this tool to find best tools by searching with keywords or regex patterns.
  If you don't have a specific tool for a task, this is the best way to discover what tools are available.
  `,
  {
    pattern: FindToolsParamsSchema.shape.pattern,
    searchIn: FindToolsParamsSchema.shape.searchIn,
    caseSensitive: FindToolsParamsSchema.shape.caseSensitive,
  },
  async (args, extra) => {
    try {
      const { pattern, searchIn, caseSensitive } = args;
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
server.tool(
  "get-tool",
  "Get complete schema for a specific tool from a specific server, including inputSchema. TIP: Use find-tools first to discover the tool and get the correct serverName and toolName",
  {
    serverName: GetToolParamsSchema.shape.serverName,
    toolName: GetToolParamsSchema.shape.toolName,
  },
  async (args, extra) => {
    try {
      const { serverName, toolName } = args;
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
server.tool(
  "list-all-tools-in-server", 
  "List ALL tools from a specific MCP server (returns name and description only)",
  {
    serverName: ListToolsInServerParamsSchema.shape.serverName,
  },
  async (args, extra) => {
    try {
      const { serverName } = args;
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
            text: `Error listing tools from server '${args.serverName}': ${(error as Error).message}`,
          },
        ],
      };
    }
  }
);

// Tool to find tools in a specific server
server.tool(
  "find-tools-in-server",
  "Find tools matching a pattern in a specific MCP server (returns name and description only)",
  {
    serverName: FindToolsInServerParamsSchema.shape.serverName,
    pattern: FindToolsInServerParamsSchema.shape.pattern,
    searchIn: FindToolsInServerParamsSchema.shape.searchIn,
    caseSensitive: FindToolsInServerParamsSchema.shape.caseSensitive,
  },
  async (args, extra) => {
    try {
      const { serverName, pattern, searchIn, caseSensitive } = args;
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
            text: `Error finding tools in server '${args.serverName}': ${(error as Error).message}`,
          },
        ],
      };
    }
  }
);

// Tool to list all connected servers
server.tool(
  "list-servers",
  "List all connected MCP servers",
  {}, // No parameters needed
  async (args, extra) => {
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
