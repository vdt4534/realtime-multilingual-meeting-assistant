# Shopify MCP Server

A comprehensive Model Context Protocol (MCP) server for Shopify Admin API integration, enabling LLMs to interact with Shopify stores for complete e-commerce management.

## Features

### Product Management
- **create_product** - Create products with variants, images, SEO settings
- **get_product** - Retrieve single product details
- **get_products** - List products with filtering (vendor, type, status, collection)
- **update_product** - Modify existing product properties
- **delete_product** - Remove products from store

### Collection Management
- **create_collection** - Create manual or smart collections with rules
- **get_collection** - Retrieve collection details
- **get_collections** - List collections with filtering
- **update_collection** - Modify collection properties
- **delete_collection** - Remove collections
- **add_product_to_collection** - Link products to collections
- **remove_product_from_collection** - Unlink products from collections

### Order Management
- **get_order** - Retrieve order details
- **get_orders** - List orders with status/date filtering
- **update_order** - Modify order notes, tags, addresses
- **create_draft_order** - Create draft orders for later completion

### Customer Management
- **create_customer** - Add new customers with addresses
- **get_customer** - Retrieve customer profile
- **get_customers** - List customers with filtering
- **update_customer** - Modify customer information
- **delete_customer** - Remove customer accounts

### Inventory Management
- **get_inventory_levels** - Check stock levels across locations
- **adjust_inventory** - Increase/decrease inventory quantities
- **get_locations** - List store locations

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your-access-token
```

### 3. Get Shopify Credentials
1. Go to Shopify Admin → Apps → App and sales channel settings
2. Click "Develop apps" → "Create an app"
3. Configure Admin API access scopes:
   - `read_products`, `write_products`
   - `read_collections`, `write_collections`  
   - `read_orders`, `write_orders`
   - `read_customers`, `write_customers`
   - `read_inventory`, `write_inventory`
4. Install app and copy access token

### 4. Build and Run
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

### 5. Configure MCP Client
Add to your MCP settings:
```json
{
  "mcpServers": {
    "shopify": {
      "command": "node",
      "args": ["/path/to/shopify-mcp-server/dist/server.js"]
    }
  }
}
```

## Usage Examples

### Create Product
```javascript
create_product({
  title: "Premium T-Shirt",
  body_html: "<p>High-quality cotton t-shirt</p>",
  vendor: "Fashion Co",
  product_type: "Clothing",
  tags: "premium, cotton, casual",
  variants: [{
    title: "Medium / Blue",
    price: "29.99",
    sku: "TSHIRT-M-BLUE",
    inventory_quantity: 100
  }]
})
```

### Create Smart Collection
```javascript
create_collection({
  title: "Sale Items",
  collection_type: "smart",
  rules: [{
    column: "compare_at_price",
    relation: "greater_than",
    condition: "0"
  }],
  disjunctive: false
})
```

### Filter Orders
```javascript
get_orders({
  status: "open",
  financial_status: "paid",
  created_at_min: "2024-01-01T00:00:00Z",
  limit: 50
})
```

## API Scope Requirements

Ensure your Shopify app has these scopes:
- `read_products`, `write_products` - Product management
- `read_collections`, `write_collections` - Collection management  
- `read_orders`, `write_orders` - Order management
- `read_customers`, `write_customers` - Customer management
- `read_inventory`, `write_inventory` - Inventory management

## Architecture

- **MCP Protocol**: Uses `@modelcontextprotocol/sdk` for stdio communication
- **Shopify Client**: Official `@shopify/admin-api-client` for API access
- **Error Handling**: Structured error responses with detailed messages
- **Type Safety**: Full TypeScript implementation with proper schemas

## Security

- Store credentials in `.env` file (never commit)
- Use private apps for production
- Limit API scopes to required permissions only
- Validate all input parameters

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-tool`)
3. Implement changes with proper error handling
4. Add tool to schema and handler
5. Test thoroughly
6. Submit pull request

## License

MIT License - see LICENSE file for details