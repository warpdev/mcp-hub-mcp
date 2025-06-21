import { z } from "zod";

export const ConnectMcpParamsSchema = z.object({
  command: z
    .string()
    .describe("Command to run the MCP server"),
  args: z
    .array(z.string())
    .optional()
    .describe("Command arguments"),
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

// MCP configuration file interface (claude_desktop_config.json format)
export interface McpServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface McpConfig {
  mcpServers: Record<string, McpServerConfig>;
}
