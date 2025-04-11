# MCP-Hub-MCP Server

A hub server that connects to and manages other MCP (Model Context Protocol) servers.

## Overview

This project builds an MCP hub server that can connect to other MCP servers, list their tools, and execute them.

## Key Features

- Automatic connection to other MCP servers via configuration file
- List connected servers
- List available tools on connected servers
- Call tools on connected servers and return results
- Disconnect from servers

## Installation and Running

### Requirements

- Node.js 18.0.0 or higher
- npm, yarn, or pnpm

### Installation

```bash
# Clone repository
git clone <repository-url>
cd mcp-hub-mcp

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Build

```bash
npm run build
# or
yarn build
# or
pnpm build
```

### Run

```bash
npm start
# or
yarn start
# or
pnpm start
```

### Development Mode

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Configuration File

The MCP-Hub-MCP server uses a Claude Desktop format configuration file to automatically connect to other MCP servers.
You can specify the configuration file in the following ways:

1. Environment variable: Set the `MCP_CONFIG_PATH` environment variable to the configuration file path
2. Command line argument: Use the `--config-path` option to specify the configuration file path
3. Default path: Use `mcp-config.json` file in the current directory

Configuration file format:

```json
{
  "mcpServers": {
    "serverName1": {
      "command": "command",
      "args": ["arg1", "arg2", ...],
      "env": { "ENV_VAR1": "value1", ... }
    },
    "serverName2": {
      "command": "anotherCommand",
      "args": ["arg1", "arg2", ...]
    }
  }
}
```

Example:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/Desktop",
        "/Users/username/Downloads"
      ]
    },
    "other-server": {
      "command": "node",
      "args": ["path/to/other-mcp-server.js"]
    }
  }
}
```

## Usage

The MCP-Hub-MCP server provides the following tools:

### 1. `list-all-tools`

Returns a list of tools from all connected servers.

```json
{
  "name": "list-all-tools",
  "arguments": {}
}
```

### 2. `call-tool`

Calls a tool on a specific server.

- `serverName`: Name of the MCP server to call the tool from
- `toolName`: Name of the tool to call
- `toolArgs`: Arguments to pass to the tool

```json
{
  "name": "call-tool",
  "arguments": {
    "serverName": "filesystem",
    "toolName": "readFile",
    "toolArgs": {
      "path": "/Users/username/Desktop/example.txt"
    }
  }
}
```

## Tech Stack

- Node.js
- TypeScript
- @modelcontextprotocol/sdk (version: ^1.9.0)
- zod (version: ^3.22.4)

## License

MIT
