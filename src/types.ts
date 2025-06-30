import { z } from "zod";

export const ConnectMcpParamsSchema = z.object({
  // For stdio servers
  command: z
    .string()
    .describe("Command to run the MCP server")
    .optional(),
  args: z
    .array(z.string())
    .optional()
    .describe("Command arguments"),
  
  // For HTTP servers
  type: z
    .enum(["stdio", "http"])
    .optional()
    .describe("Server transport type"),
  url: z
    .string()
    .describe("URL for HTTP-based MCP server")
    .optional(),
  headers: z
    .record(z.string())
    .optional()
    .describe("HTTP headers for authentication"),
  
  // Environment variables (applies to both)
  env: z
    .record(z.string())
    .optional()
    .describe("Environment variables"),
});

export type ConnectMcpParams = z.infer<
  typeof ConnectMcpParamsSchema
>;

export const ListToolsParamsSchema = z.object({
  serverName: z
    .string()
    .describe("Name of the MCP server to list tools from"),
});

export type ListToolsParams = z.infer<
  typeof ListToolsParamsSchema
>;

export const CallToolParamsSchema = z.object({
  serverName: z
    .string()
    .describe("Name of the MCP server to call tool from"),
  toolName: z.string().describe("Name of the tool to call"),
  toolArgs: z
    .record(z.unknown())
    .describe("Arguments to pass to the tool"),
});

export type CallToolParams = z.infer<
  typeof CallToolParamsSchema
>;

export const FindToolsParamsSchema = z.object({
  pattern: z
    .string()
    .describe("Regex pattern to search for in tool names and descriptions"),
  searchIn: z
    .enum(["name", "description", "both"])
    .optional()
    .default("both")
    .describe("Where to search: in tool names, descriptions, or both"),
  caseSensitive: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether the search should be case-sensitive"),
});

export type FindToolsParams = z.infer<
  typeof FindToolsParamsSchema
>;

export const GetToolParamsSchema = z.object({
  serverName: z
    .string()
    .describe("Name of the MCP server containing the tool"),
  toolName: z
    .string()
    .describe("Exact name of the tool to retrieve"),
});

export type GetToolParams = z.infer<
  typeof GetToolParamsSchema
>;

export const ListToolsInServerParamsSchema = z.object({
  serverName: z
    .string()
    .describe("Name of the MCP server to list tools from"),
});

export type ListToolsInServerParams = z.infer<
  typeof ListToolsInServerParamsSchema
>;

export const FindToolsInServerParamsSchema = z.object({
  serverName: z
    .string()
    .describe("Name of the MCP server to search tools in"),
  pattern: z
    .string()
    .describe("Regex pattern to search for in tool names and descriptions"),
  searchIn: z
    .enum(["name", "description", "both"])
    .default("both")
    .describe("Where to search: in tool names, descriptions, or both"),
  caseSensitive: z
    .boolean()
    .default(false)
    .describe("Whether the search should be case-sensitive"),
});

export type FindToolsInServerParams = z.infer<
  typeof FindToolsInServerParamsSchema
>;

// MCP configuration file interface (claude_desktop_config.json format)
export interface McpServerConfig {
  // For stdio servers
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  
  // For HTTP servers  
  type?: "stdio" | "http";
  url?: string;
  headers?: Record<string, string>;
}

export interface McpConfig {
  mcpServers: Record<string, McpServerConfig>;
}
