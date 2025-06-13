#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createAdminApiClient } from '@shopify/admin-api-client';
import * as dotenv from 'dotenv';

dotenv.config();

const client = createAdminApiClient({
  storeDomain: process.env.SHOPIFY_STORE_URL!,
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN!,
  apiVersion: '2024-01',
});

const server = new Server(
  {
    name: 'shopify-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Product Management Tools
      {
        name: 'create_product',
        description: 'Create a new product with variants, images, and SEO settings',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Product title' },
            body_html: { type: 'string', description: 'Product description in HTML' },
            vendor: { type: 'string', description: 'Product vendor' },
            product_type: { type: 'string', description: 'Product type' },
            tags: { type: 'string', description: 'Comma-separated tags' },
            handle: { type: 'string', description: 'URL handle (optional)' },
            status: { type: 'string', enum: ['active', 'archived', 'draft'], description: 'Product status' },
            variants: {
              type: 'array',
              description: 'Product variants',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  price: { type: 'string' },
                  sku: { type: 'string' },
                  inventory_quantity: { type: 'number' },
                  inventory_management: { type: 'string', enum: ['shopify', 'not_managed'] },
                  weight: { type: 'number' },
                  weight_unit: { type: 'string', enum: ['g', 'kg', 'oz', 'lb'] }
                }
              }
            },
            images: {
              type: 'array',
              description: 'Product images',
              items: {
                type: 'object',
                properties: {
                  src: { type: 'string', description: 'Image URL' },
                  alt: { type: 'string', description: 'Alt text' }
                }
              }
            },
            seo_title: { type: 'string', description: 'SEO title' },
            seo_description: { type: 'string', description: 'SEO description' }
          },
          required: ['title']
        }
      },
      {
        name: 'get_product',
        description: 'Get a single product by ID',
        inputSchema: {
          type: 'object',
          properties: {
            product_id: { type: 'string', description: 'Product ID' }
          },
          required: ['product_id']
        }
      },
      {
        name: 'get_products',
        description: 'Get products list with filtering and pagination',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Number of products to return (max 250)' },
            vendor: { type: 'string', description: 'Filter by vendor' },
            product_type: { type: 'string', description: 'Filter by product type' },
            collection_id: { type: 'string', description: 'Filter by collection ID' },
            status: { type: 'string', enum: ['active', 'archived', 'draft'], description: 'Filter by status' },
            title: { type: 'string', description: 'Search by title' }
          }
        }
      },
      {
        name: 'update_product',
        description: 'Update an existing product',
        inputSchema: {
          type: 'object',
          properties: {
            product_id: { type: 'string', description: 'Product ID' },
            title: { type: 'string', description: 'Product title' },
            body_html: { type: 'string', description: 'Product description' },
            vendor: { type: 'string', description: 'Product vendor' },
            product_type: { type: 'string', description: 'Product type' },
            tags: { type: 'string', description: 'Comma-separated tags' },
            status: { type: 'string', enum: ['active', 'archived', 'draft'] },
            seo_title: { type: 'string', description: 'SEO title' },
            seo_description: { type: 'string', description: 'SEO description' }
          },
          required: ['product_id']
        }
      },
      {
        name: 'delete_product',
        description: 'Delete a product',
        inputSchema: {
          type: 'object',
          properties: {
            product_id: { type: 'string', description: 'Product ID' }
          },
          required: ['product_id']
        }
      },

      // Collection Management Tools
      {
        name: 'create_collection',
        description: 'Create a new collection',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Collection title' },
            body_html: { type: 'string', description: 'Collection description' },
            handle: { type: 'string', description: 'URL handle (optional)' },
            collection_type: { type: 'string', enum: ['smart', 'custom'], description: 'Collection type' },
            rules: {
              type: 'array',
              description: 'Rules for smart collections',
              items: {
                type: 'object',
                properties: {
                  column: { type: 'string' },
                  relation: { type: 'string' },
                  condition: { type: 'string' }
                }
              }
            },
            disjunctive: { type: 'boolean', description: 'Use OR logic for smart collection rules' },
            sort_order: { type: 'string', enum: ['alpha-asc', 'alpha-desc', 'best-selling', 'created', 'created-desc', 'manual', 'price-asc', 'price-desc'] },
            template_suffix: { type: 'string', description: 'Template suffix' },
            published: { type: 'boolean', description: 'Whether collection is published' }
          },
          required: ['title']
        }
      },
      {
        name: 'get_collection',
        description: 'Get a single collection by ID',
        inputSchema: {
          type: 'object',
          properties: {
            collection_id: { type: 'string', description: 'Collection ID' }
          },
          required: ['collection_id']
        }
      },
      {
        name: 'get_collections',
        description: 'Get collections list with filtering',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Number of collections to return' },
            title: { type: 'string', description: 'Search by title' },
            handle: { type: 'string', description: 'Filter by handle' }
          }
        }
      },
      {
        name: 'update_collection',
        description: 'Update an existing collection',
        inputSchema: {
          type: 'object',
          properties: {
            collection_id: { type: 'string', description: 'Collection ID' },
            title: { type: 'string', description: 'Collection title' },
            body_html: { type: 'string', description: 'Collection description' },
            handle: { type: 'string', description: 'URL handle' },
            sort_order: { type: 'string', enum: ['alpha-asc', 'alpha-desc', 'best-selling', 'created', 'created-desc', 'manual', 'price-asc', 'price-desc'] },
            template_suffix: { type: 'string', description: 'Template suffix' },
            published: { type: 'boolean', description: 'Whether collection is published' }
          },
          required: ['collection_id']
        }
      },
      {
        name: 'delete_collection',
        description: 'Delete a collection',
        inputSchema: {
          type: 'object',
          properties: {
            collection_id: { type: 'string', description: 'Collection ID' }
          },
          required: ['collection_id']
        }
      },
      {
        name: 'add_product_to_collection',
        description: 'Add a product to a collection',
        inputSchema: {
          type: 'object',
          properties: {
            product_id: { type: 'string', description: 'Product ID' },
            collection_id: { type: 'string', description: 'Collection ID' }
          },
          required: ['product_id', 'collection_id']
        }
      },

      // Order Management Tools
      {
        name: 'get_order',
        description: 'Get a single order by ID',
        inputSchema: {
          type: 'object',
          properties: {
            order_id: { type: 'string', description: 'Order ID' }
          },
          required: ['order_id']
        }
      },
      {
        name: 'get_orders',
        description: 'Get orders list with filtering',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Number of orders to return' },
            status: { type: 'string', enum: ['open', 'closed', 'cancelled', 'any'], description: 'Order status' },
            financial_status: { type: 'string', enum: ['authorized', 'pending', 'paid', 'partially_paid', 'refunded', 'voided', 'partially_refunded', 'any'], description: 'Financial status' },
            fulfillment_status: { type: 'string', enum: ['shipped', 'partial', 'unshipped', 'any'], description: 'Fulfillment status' },
            created_at_min: { type: 'string', description: 'Filter orders created after this date (ISO 8601)' },
            created_at_max: { type: 'string', description: 'Filter orders created before this date (ISO 8601)' },
            customer_id: { type: 'string', description: 'Filter by customer ID' }
          }
        }
      },

      // Customer Management Tools
      {
        name: 'create_customer',
        description: 'Create a new customer',
        inputSchema: {
          type: 'object',
          properties: {
            first_name: { type: 'string', description: 'Customer first name' },
            last_name: { type: 'string', description: 'Customer last name' },
            email: { type: 'string', description: 'Customer email' },
            phone: { type: 'string', description: 'Customer phone' },
            tags: { type: 'string', description: 'Comma-separated tags' },
            note: { type: 'string', description: 'Customer note' }
          },
          required: ['email']
        }
      },
      {
        name: 'get_customer',
        description: 'Get a single customer by ID',
        inputSchema: {
          type: 'object',
          properties: {
            customer_id: { type: 'string', description: 'Customer ID' }
          },
          required: ['customer_id']
        }
      },
      {
        name: 'get_customers',
        description: 'Get customers list with filtering',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Number of customers to return' },
            email: { type: 'string', description: 'Search by email' },
            created_at_min: { type: 'string', description: 'Filter customers created after this date' },
            created_at_max: { type: 'string', description: 'Filter customers created before this date' }
          }
        }
      },
      {
        name: 'update_customer',
        description: 'Update an existing customer',
        inputSchema: {
          type: 'object',
          properties: {
            customer_id: { type: 'string', description: 'Customer ID' },
            first_name: { type: 'string', description: 'Customer first name' },
            last_name: { type: 'string', description: 'Customer last name' },
            email: { type: 'string', description: 'Customer email' },
            phone: { type: 'string', description: 'Customer phone' },
            tags: { type: 'string', description: 'Comma-separated tags' },
            note: { type: 'string', description: 'Customer note' }
          },
          required: ['customer_id']
        }
      },
      {
        name: 'delete_customer',
        description: 'Delete a customer',
        inputSchema: {
          type: 'object',
          properties: {
            customer_id: { type: 'string', description: 'Customer ID' }
          },
          required: ['customer_id']
        }
      },

      // Inventory Management Tools
      {
        name: 'get_inventory_levels',
        description: 'Get inventory levels for products',
        inputSchema: {
          type: 'object',
          properties: {
            inventory_item_ids: { type: 'string', description: 'Comma-separated inventory item IDs' },
            location_ids: { type: 'string', description: 'Comma-separated location IDs' },
            limit: { type: 'number', description: 'Number of items to return' }
          }
        }
      },
      {
        name: 'get_locations',
        description: 'Get store locations',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Number of locations to return' }
          }
        }
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (!args) {
    return {
      content: [{ type: 'text', text: 'Error: No arguments provided' }],
      isError: true
    };
  }

  try {
    switch (name) {
      // Product Management
      case 'create_product':
        const productData: any = {
          product: {
            title: args.title,
            body_html: args.body_html || '',
            vendor: args.vendor || '',
            product_type: args.product_type || '',
            tags: args.tags || '',
            status: args.status || 'active'
          }
        };

        if (args.handle) productData.product.handle = args.handle;
        if (args.seo_title || args.seo_description) {
          productData.product.seo = {};
          if (args.seo_title) productData.product.seo.title = args.seo_title;
          if (args.seo_description) productData.product.seo.description = args.seo_description;
        }

        if (args.variants && Array.isArray(args.variants) && args.variants.length > 0) {
          productData.product.variants = args.variants;
        }

        if (args.images && Array.isArray(args.images) && args.images.length > 0) {
          productData.product.images = args.images;
        }

        const productResponse = await client.request(`
          mutation productCreate($input: ProductInput!) {
            productCreate(input: $input) {
              product {
                id
                title
                handle
                status
                vendor
                productType
                tags
                createdAt
                updatedAt
              }
              userErrors {
                field
                message
              }
            }
          }
        `, {
          variables: {
            input: productData.product
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(productResponse, null, 2) }]
        };

      case 'get_product':
        const productQuery = await client.request(`
          query getProduct($id: ID!) {
            product(id: $id) {
              id
              title
              handle
              description
              vendor
              productType
              tags
              status
              createdAt
              updatedAt
              variants(first: 250) {
                edges {
                  node {
                    id
                    title
                    price
                    sku
                    inventoryQuantity
                  }
                }
              }
              images(first: 10) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
              }
            }
          }
        `, {
          variables: {
            id: `gid://shopify/Product/${args.product_id}`
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(productQuery, null, 2) }]
        };

      case 'get_products':
        let queryString = `
          query getProducts($first: Int!) {
            products(first: $first) {
              edges {
                node {
                  id
                  title
                  handle
                  vendor
                  productType
                  status
                  createdAt
                  updatedAt
                  tags
                }
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
              }
            }
          }
        `;

        const productsQuery = await client.request(queryString, {
          variables: {
            first: args.limit || 50
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(productsQuery, null, 2) }]
        };

      case 'update_product':
        const updateInput: any = {};
        if (args.title) updateInput.title = args.title;
        if (args.body_html) updateInput.descriptionHtml = args.body_html;
        if (args.vendor) updateInput.vendor = args.vendor;
        if (args.product_type) updateInput.productType = args.product_type;
        if (args.tags && typeof args.tags === 'string') updateInput.tags = args.tags.split(',').map((tag: string) => tag.trim());
        if (args.status) updateInput.status = args.status;

        const updateResponse = await client.request(`
          mutation productUpdate($input: ProductInput!, $id: ID!) {
            productUpdate(input: $input, id: $id) {
              product {
                id
                title
                handle
                status
                vendor
                productType
                tags
                updatedAt
              }
              userErrors {
                field
                message
              }
            }
          }
        `, {
          variables: {
            id: `gid://shopify/Product/${args.product_id}`,
            input: updateInput
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(updateResponse, null, 2) }]
        };

      case 'delete_product':
        const deleteResponse = await client.request(`
          mutation productDelete($input: ProductDeleteInput!) {
            productDelete(input: $input) {
              deletedProductId
              userErrors {
                field
                message
              }
            }
          }
        `, {
          variables: {
            input: {
              id: `gid://shopify/Product/${args.product_id}`
            }
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(deleteResponse, null, 2) }]
        };

      // Collection Management
      case 'create_collection':
        const collectionInput: any = {
          title: args.title,
          descriptionHtml: args.body_html || '',
          handle: args.handle,
          sortOrder: args.sort_order || 'MANUAL'
        };

        const collectionResponse = await client.request(`
          mutation collectionCreate($input: CollectionInput!) {
            collectionCreate(input: $input) {
              collection {
                id
                title
                handle
                descriptionHtml
                sortOrder
                updatedAt
              }
              userErrors {
                field
                message
              }
            }
          }
        `, {
          variables: {
            input: collectionInput
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(collectionResponse, null, 2) }]
        };

      case 'get_collection':
        const collectionQuery = await client.request(`
          query getCollection($id: ID!) {
            collection(id: $id) {
              id
              title
              handle
              description
              sortOrder
              updatedAt
              productsCount
              products(first: 10) {
                edges {
                  node {
                    id
                    title
                    handle
                  }
                }
              }
            }
          }
        `, {
          variables: {
            id: `gid://shopify/Collection/${args.collection_id}`
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(collectionQuery, null, 2) }]
        };

      case 'get_collections':
        const collectionsQuery = await client.request(`
          query getCollections($first: Int!) {
            collections(first: $first) {
              edges {
                node {
                  id
                  title
                  handle
                  sortOrder
                  updatedAt
                  productsCount
                }
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
              }
            }
          }
        `, {
          variables: {
            first: args.limit || 50
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(collectionsQuery, null, 2) }]
        };

      case 'update_collection':
        const collectionUpdateInput: any = {};
        if (args.title) collectionUpdateInput.title = args.title;
        if (args.body_html) collectionUpdateInput.descriptionHtml = args.body_html;
        if (args.handle) collectionUpdateInput.handle = args.handle;
        if (args.sort_order) collectionUpdateInput.sortOrder = args.sort_order;

        const collectionUpdateResponse = await client.request(`
          mutation collectionUpdate($input: CollectionInput!, $id: ID!) {
            collectionUpdate(input: $input, id: $id) {
              collection {
                id
                title
                handle
                descriptionHtml
                sortOrder
                updatedAt
              }
              userErrors {
                field
                message
              }
            }
          }
        `, {
          variables: {
            id: `gid://shopify/Collection/${args.collection_id}`,
            input: collectionUpdateInput
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(collectionUpdateResponse, null, 2) }]
        };

      case 'delete_collection':
        const collectionDeleteResponse = await client.request(`
          mutation collectionDelete($input: CollectionDeleteInput!) {
            collectionDelete(input: $input) {
              deletedCollectionId
              userErrors {
                field
                message
              }
            }
          }
        `, {
          variables: {
            input: {
              id: `gid://shopify/Collection/${args.collection_id}`
            }
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(collectionDeleteResponse, null, 2) }]
        };

      case 'add_product_to_collection':
        const addProductResponse = await client.request(`
          mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
            collectionAddProducts(id: $id, productIds: $productIds) {
              collection {
                id
                title
                productsCount
              }
              userErrors {
                field
                message
              }
            }
          }
        `, {
          variables: {
            id: `gid://shopify/Collection/${args.collection_id}`,
            productIds: [`gid://shopify/Product/${args.product_id}`]
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(addProductResponse, null, 2) }]
        };

      // Order Management
      case 'get_order':
        const orderQuery = await client.request(`
          query getOrder($id: ID!) {
            order(id: $id) {
              id
              name
              email
              createdAt
              updatedAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              financialStatus
              fulfillmentStatus
              customer {
                id
                firstName
                lastName
                email
              }
              lineItems(first: 250) {
                edges {
                  node {
                    id
                    title
                    quantity
                    variant {
                      id
                      title
                      price
                    }
                  }
                }
              }
            }
          }
        `, {
          variables: {
            id: `gid://shopify/Order/${args.order_id}`
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(orderQuery, null, 2) }]
        };

      case 'get_orders':
        const ordersQuery = await client.request(`
          query getOrders($first: Int!) {
            orders(first: $first) {
              edges {
                node {
                  id
                  name
                  email
                  createdAt
                  totalPriceSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                  financialStatus
                  fulfillmentStatus
                  customer {
                    id
                    firstName
                    lastName
                  }
                }
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
              }
            }
          }
        `, {
          variables: {
            first: args.limit || 50
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(ordersQuery, null, 2) }]
        };

      // Customer Management
      case 'create_customer':
        const customerInput: any = {
          email: args.email
        };

        if (args.first_name) customerInput.firstName = args.first_name;
        if (args.last_name) customerInput.lastName = args.last_name;
        if (args.phone) customerInput.phone = args.phone;
        if (args.tags && typeof args.tags === 'string') customerInput.tags = args.tags.split(',').map((tag: string) => tag.trim());
        if (args.note) customerInput.note = args.note;

        const customerResponse = await client.request(`
          mutation customerCreate($input: CustomerInput!) {
            customerCreate(input: $input) {
              customer {
                id
                firstName
                lastName
                email
                phone
                tags
                note
                createdAt
              }
              userErrors {
                field
                message
              }
            }
          }
        `, {
          variables: {
            input: customerInput
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(customerResponse, null, 2) }]
        };

      case 'get_customer':
        const customerQuery = await client.request(`
          query getCustomer($id: ID!) {
            customer(id: $id) {
              id
              firstName
              lastName
              email
              phone
              tags
              note
              createdAt
              updatedAt
              orders(first: 10) {
                edges {
                  node {
                    id
                    name
                    totalPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    createdAt
                  }
                }
              }
            }
          }
        `, {
          variables: {
            id: `gid://shopify/Customer/${args.customer_id}`
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(customerQuery, null, 2) }]
        };

      case 'get_customers':
        const customersQuery = await client.request(`
          query getCustomers($first: Int!) {
            customers(first: $first) {
              edges {
                node {
                  id
                  firstName
                  lastName
                  email
                  phone
                  tags
                  createdAt
                  updatedAt
                }
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
              }
            }
          }
        `, {
          variables: {
            first: args.limit || 50
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(customersQuery, null, 2) }]
        };

      case 'update_customer':
        const customerUpdateInput: any = {};
        if (args.first_name) customerUpdateInput.firstName = args.first_name;
        if (args.last_name) customerUpdateInput.lastName = args.last_name;
        if (args.email) customerUpdateInput.email = args.email;
        if (args.phone) customerUpdateInput.phone = args.phone;
        if (args.tags && typeof args.tags === 'string') customerUpdateInput.tags = args.tags.split(',').map((tag: string) => tag.trim());
        if (args.note) customerUpdateInput.note = args.note;

        const customerUpdateResponse = await client.request(`
          mutation customerUpdate($input: CustomerInput!, $id: ID!) {
            customerUpdate(input: $input, id: $id) {
              customer {
                id
                firstName
                lastName
                email
                phone
                tags
                note
                updatedAt
              }
              userErrors {
                field
                message
              }
            }
          }
        `, {
          variables: {
            id: `gid://shopify/Customer/${args.customer_id}`,
            input: customerUpdateInput
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(customerUpdateResponse, null, 2) }]
        };

      case 'delete_customer':
        const customerDeleteResponse = await client.request(`
          mutation customerDelete($input: CustomerDeleteInput!) {
            customerDelete(input: $input) {
              deletedCustomerId
              userErrors {
                field
                message
              }
            }
          }
        `, {
          variables: {
            input: {
              id: `gid://shopify/Customer/${args.customer_id}`
            }
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(customerDeleteResponse, null, 2) }]
        };

      // Inventory Management
      case 'get_inventory_levels':
        const inventoryQuery = await client.request(`
          query getInventoryLevels($first: Int!) {
            inventoryLevels(first: $first) {
              edges {
                node {
                  id
                  available
                  item {
                    id
                    sku
                    unitCost {
                      amount
                      currencyCode
                    }
                  }
                  location {
                    id
                    name
                  }
                }
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
              }
            }
          }
        `, {
          variables: {
            first: args.limit || 50
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(inventoryQuery, null, 2) }]
        };

      case 'get_locations':
        const locationsQuery = await client.request(`
          query getLocations($first: Int!) {
            locations(first: $first) {
              edges {
                node {
                  id
                  name
                  address {
                    address1
                    address2
                    city
                    province
                    country
                    zip
                  }
                  isActive
                }
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
              }
            }
          }
        `, {
          variables: {
            first: args.limit || 50
          }
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(locationsQuery, null, 2) }]
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