# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Shopify MCP (Model Context Protocol) server that provides Claude Code with tools to interact with Shopify stores. The server implements the MCP protocol to expose Shopify Admin API operations as callable tools.

**Current Status**: This is a planning-stage repository with comprehensive documentation but no implementation yet. All source files need to be created based on the detailed specifications in `Doc/shopify_mcp_setup.md`.

## Architecture

- **MCP Server**: Uses `@modelcontextprotocol/sdk` to create a stdio-based MCP server
- **Shopify Integration**: Uses `@shopify/admin-api-client` for Shopify Admin API access
- **Communication**: Server communicates with Claude via stdio transport
- **Authentication**: Uses private app credentials (store URL + access token)
- **Transport**: Stdio-based communication for MCP protocol

## Project Structure

```
src/
├── server.ts          # Main MCP server implementation
├── types.ts           # TypeScript type definitions
└── utils/             # Utility functions (if needed)

Doc/                   # Comprehensive implementation documentation
├── shopify_mcp_setup.md              # Complete setup guide with code
├── Shopify Platform Overview.md      # API overview
└── Shopify Admin API Exploration.md  # API exploration notes
```

## Development Commands

**Initial Setup** (files don't exist yet):
```bash
# Create package.json and install dependencies (see Doc/shopify_mcp_setup.md)
npm init -y
npm install @modelcontextprotocol/sdk @shopify/admin-api-client dotenv
npm install -D typescript @types/node ts-node

# Development mode (after implementation)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run compiled server
npm start
```

## Implementation Requirements

Before the server can run, these files must be created:

1. **package.json** - With dependencies and scripts as specified in documentation
2. **src/server.ts** - Main MCP server implementation (full code in `Doc/shopify_mcp_setup.md`)
3. **tsconfig.json** - TypeScript configuration
4. **.env** - Environment variables (use `.env.example` template)
5. **.gitignore** - Node.js standard gitignore

## Environment Setup

Required `.env` file:
```env
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your-access-token
MCP_SERVER_PORT=3001
```

## Core MCP Tools

The server will implement these Shopify operations as MCP tools:
- `add_product` - Create new products with variants and inventory management
- `update_collection` - Modify collection properties and metadata
- `get_products` - Retrieve product listings with optional filtering by title, vendor, status
- `add_product_to_collection` - Link products to collections via Collect resource

## Key Dependencies

- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `@shopify/admin-api-client` - Official Shopify API client
- `typescript`, `@types/node`, `ts-node` - TypeScript development tools
- `dotenv` - Environment variable management

## MCP Tool Implementation Pattern

Each tool follows this structure in `src/server.ts`:
```typescript
// Tool definition in server.list_tools()
{
  name: "tool_name",
  description: "Tool description",
  inputSchema: { /* JSON Schema */ }
}

// Tool handler in server.call_tool()
case "tool_name":
  // Validate input
  // Call Shopify API
  // Return structured response
```

## Server Architecture

- **Entry Point**: `src/server.ts` - Main MCP server with tool definitions and handlers
- **Communication**: Uses `@modelcontextprotocol/sdk/server/stdio` for stdio transport
- **Error Handling**: Returns structured MCP error responses with descriptive messages
- **API Version**: Uses Shopify REST Admin API v2024-01
- **Authentication**: Shopify Admin API client with store URL and access token

## Documentation Reference

- `Doc/shopify_mcp_setup.md` - Complete implementation guide with working code
- `Doc/Shopify Platform Overview.md` - Available Shopify APIs and capabilities
- `Doc/Shopify Admin API Exploration.md` - API exploration and usage patterns