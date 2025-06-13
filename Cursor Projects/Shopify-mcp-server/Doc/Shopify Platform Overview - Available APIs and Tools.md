# Shopify Platform Overview - Available APIs and Tools

## Overview
This document provides a high-level overview of the four major Shopify development platforms and APIs available through the MCP (Model Context Protocol) server, each serving different aspects of e-commerce development.

## 1. Shopify Admin API
**Purpose**: Complete store management and backend operations

### Core Capabilities
- **Product Management**: Create, update, delete products with variants, images, and inventory
- **Order Processing**: Manage orders, fulfillment, payments, and refunds
- **Customer Management**: Handle customer profiles, addresses, and relationship data
- **Collection Management**: Organize products into collections with automated or manual rules
- **Inventory Control**: Track stock levels, manage variants, and handle SKUs
- **Store Configuration**: Access store settings, policies, and operational data

### Key Features
- **GraphQL-based API** with comprehensive queries and mutations
- **Real-time data access** to live store information
- **Bulk operations** for high-volume data processing
- **Advanced filtering and pagination** across all resource types
- **Webhook integration** for event-driven workflows

### Use Cases
- Store administration and management
- Third-party app development
- Data synchronization and reporting
- Automated inventory management
- Custom business logic implementation

---

## 2. Shopify Functions
**Purpose**: Backend logic customization and business rule implementation

### Core Capabilities
- **Discount Logic**: Create custom discount rules for products, orders, and shipping
- **Cart & Checkout Validation**: Implement custom validation rules and constraints
- **Cart Transformation**: Modify cart line items and presentation logic
- **Delivery Customization**: Control shipping options and delivery methods
- **Payment Customization**: Customize payment method availability and ordering
- **Fulfillment Logic**: Define custom fulfillment and allocation rules

### Technical Features
- **Pure functions** (no network, filesystem, or external dependencies)
- **Multiple programming languages** (Rust, JavaScript, TypeScript)
- **Event-driven execution** at specific checkout and cart events
- **GraphQL input/output** with strongly typed schemas
- **Shopify CLI integration** for development and deployment

### Use Cases
- Custom pricing and discount strategies
- Complex shipping calculations
- Business-specific validation rules
- Multi-location fulfillment logic
- Specialized payment flows

---

## 3. Hydrogen - Headless Storefront Features
**Purpose**: Advanced headless storefront functionality and customer experience

### Core Capabilities
- **Product Bundles**: Special styling and display for bundled products with badges and cover images
- **Subscription Management**: Implement selling plans for recurring purchases and subscriptions
- **Combined Listings**: Group separate products into unified listings with shared options
- **Market Segmentation**: Serve different content based on geographic location and market

### Technical Features
- **React-based framework** optimized for Shopify storefronts
- **Server-side rendering** for performance and SEO
- **Shopify-specific hooks** and utilities
- **Market-aware routing** and content delivery
- **Performance optimization** out of the box

### Use Cases
- High-performance custom storefronts
- Multi-market international stores
- Subscription-based businesses
- Complex product configuration scenarios
- Brand-specific shopping experiences

---

## 4. Storefront Web Components
**Purpose**: HTML-based storefront development without frameworks

### Core Capabilities
- **Complete Component Library**: Pre-built web components for all storefront needs
- **Product Display**: Images, pricing, variants, and product information
- **Shopping Cart**: Full cart functionality with add/remove/update operations
- **Data Binding**: Automatic synchronization with Shopify data
- **Context Management**: Hierarchical data contexts for different store sections

### Key Components
- **`<shopify-store>`**: Store configuration and market settings
- **`<shopify-context>`**: Data context for products, collections, customers
- **`<shopify-cart>`**: Shopping cart with modal functionality
- **`<shopify-variant-selector>`**: Product option selection interface
- **`<shopify-media>`**: Optimized image and video display
- **`<shopify-money>`**: Formatted price display with currency

### Technical Features
- **Pure HTML/CSS/JavaScript** - no framework dependencies
- **Responsive design** with mobile-first approach
- **Accessibility compliant** with WCAG guidelines
- **SEO optimized** with proper semantic markup
- **Customizable styling** via CSS parts and slots

### Use Cases
- Rapid storefront prototyping
- Framework-agnostic implementations
- Educational and learning projects
- Lightweight storefronts
- Integration with existing websites

---

## Integration and Use Cases

### When to Use Each Platform

**Admin API**: When you need to manage store data, integrate with business systems, or build administrative tools.

**Functions**: When you need to customize Shopify's core business logic, implement complex pricing rules, or add validation layers.

**Hydrogen**: When building high-performance, custom storefronts with advanced features like subscriptions or multi-market support.

**Web Components**: When you want to quickly build storefronts with minimal dependencies or integrate Shopify functionality into existing websites.

### Platform Combinations
- **Admin API + Functions**: Complete backend customization with store management
- **Hydrogen + Admin API**: Full-stack e-commerce applications
- **Web Components + Admin API**: Lightweight storefronts with admin integration
- **All platforms**: Comprehensive e-commerce ecosystems with custom logic, management tools, and optimized frontends