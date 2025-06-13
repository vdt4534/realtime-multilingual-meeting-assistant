# Shopify MCP Server - Local Setup Guide

## Prerequisites
- Node.js 18+ installed
- Shopify store with Admin API access
- Private app or API credentials

## Quick Setup

### 1. Create Project Structure
```bash
mkdir shopify-mcp-server
cd shopify-mcp-server
npm init -y
```

### 2. Install Dependencies
```bash
npm install @modelcontextprotocol/sdk @shopify/admin-api-client dotenv
npm install -D typescript @types/node ts-node
```

### 3. Create Environment File
Create `.env`:
```
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your-access-token
MCP_SERVER_PORT=3001
```

### 4. Main Server File
Create `src/server.ts`:
```typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { shopifyApi } from '@shopify/admin-api-client';
import * as dotenv from 'dotenv';

dotenv.config();

const client = shopifyApi({
  storeDomain: process.env.SHOPIFY_STORE_URL!,
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN!,
  apiVersion: '2024-01',
});

const server = new Server(
  {
    name: 'shopify-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'add_product',
        description: 'Add a new product to Shopify',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            body_html: { type: 'string' },
            vendor: { type: 'string' },
            product_type: { type: 'string' },
            tags: { type: 'string' },
            price: { type: 'string' },
            inventory_quantity: { type: 'number' }
          },
          required: ['title', 'price']
        }
      },
      {
        name: 'update_collection',
        description: 'Update a collection',
        inputSchema: {
          type: 'object',
          properties: {
            collection_id: { type: 'string' },
            title: { type: 'string' },
            body_html: { type: 'string' },
            handle: { type: 'string' }
          },
          required: ['collection_id']
        }
      },
      {
        name: 'get_products',
        description: 'Get products list',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number' },
            collection_id: { type: 'string' }
          }
        }
      },
      {
        name: 'add_product_to_collection',
        description: 'Add product to collection',
        inputSchema: {
          type: 'object',
          properties: {
            product_id: { type: 'string' },
            collection_id: { type: 'string' }
          },
          required: ['product_id', 'collection_id']
        }
      }
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'add_product':
        const product = await client.rest.Product.save({
          session: client.session,
          title: args.title,
          body_html: args.body_html || '',
          vendor: args.vendor || '',
          product_type: args.product_type || '',
          tags: args.tags || '',
          variants: [{
            price: args.price,
            inventory_quantity: args.inventory_quantity || 0
          }]
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(product, null, 2) }]
        };

      case 'update_collection':
        const collection = await client.rest.Collection.save({
          session: client.session,
          id: args.collection_id,
          title: args.title,
          body_html: args.body_html,
          handle: args.handle
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(collection, null, 2) }]
        };

      case 'get_products':
        const products = await client.rest.Product.all({
          session: client.session,
          limit: args.limit || 50,
          collection_id: args.collection_id
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(products, null, 2) }]
        };

      case 'add_product_to_collection':
        const collect = await client.rest.Collect.save({
          session: client.session,
          product_id: args.product_id,
          collection_id: args.collection_id
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(collect, null, 2) }]
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ 
        type: 'text', 
        text: `Error: ${error instanceof Error ? error.message : String(error)}` 
      }],
      isError: true
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Shopify MCP server running on stdio');
}

run().catch(console.error);
```

### 5. Package.json Scripts
Add to `package.json`:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node src/server.ts"
  }
}
```

### 6. TypeScript Config
Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Usage

### 1. Get Shopify Credentials
- Go to your Shopify admin
- Apps > App and sales channel settings > Develop apps
- Create private app with Admin API access
- Copy store URL and access token

### 2. Run Server
```bash
npm run dev
```

### 3. Test with Claude
Configure Claude to use your MCP server by adding to your MCP settings:
```json
{
  "mcpServers": {
    "shopify": {
      "command": "node",
      "args": ["/path/to/your/shopify-mcp-server/dist/server.js"]
    }
  }
}
```

## Available Functions
- `add_product` - Create new products
- `update_collection` - Modify collections
- `get_products` - List products
- `add_product_to_collection` - Add products to collections

## Security Notes
- Keep `.env` file secure
- Use private apps for production
- Limit API permissions to needed scopes

## Next Steps
- Add more Shopify operations as needed
- Implement error handling
- Add logging for debugging