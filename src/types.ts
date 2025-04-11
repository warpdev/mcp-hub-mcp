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

// MCP configuration file interface (claude_desktop_config.json format)
export interface McpServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface McpConfig {
  mcpServers: Record<string, McpServerConfig>;
}
