# Shopify Storefront Web Components API Summary

## Overview

Shopify Storefront Web Components provide a powerful way to create **standalone commerce websites** using only HTML and Shopify's APIs. This documentation covers implementation strategies, capabilities, limitations, and practical workflows for integrating web components with existing Shopify themes.

## Table of Contents

1. [Core Capabilities](#core-capabilities)
2. [Architecture & Components](#architecture--components)
3. [Theme Integration Limitations](#theme-integration-limitations)
4. [Hybrid Implementation Approaches](#hybrid-implementation-approaches)
5. [Development Workflows](#development-workflows)
6. [Implementation Examples](#implementation-examples)
7. [Best Practices](#best-practices)
8. [Resources](#resources)

## Core Capabilities

### E-commerce Functionality
- **Complete Shopping Experience**: Product catalogs, cart, checkout flows
- **Product Management**: Variants, inventory, dynamic pricing
- **Collection Browsing**: Filtering, search, pagination
- **Customer Features**: Authentication, accounts, order history
- **Internationalization**: Multi-currency, multi-language support

### Advanced Features
- **Dynamic Variant Selection**: Real-time updates for pricing and images
- **Rich Product Displays**: Galleries, descriptions, metadata
- **Search & Filtering**: Faceted search with real-time results
- **Interactive Shopping Cart**: Add/remove with modal support
- **Responsive Design**: Built-in mobile optimization

### Customization Options
- **CSS Parts**: Target internal component elements
- **Slots**: Replace default content sections
- **Custom Styling**: Full CSS control over appearance
- **Component Attributes**: Configure behavior and data sources

## Architecture & Components

### Basic Structure
```html
<shopify-store store-domain="your-store.myshopify.com">
  <!-- All components must be within this wrapper -->
  
  <shopify-context type="product" handle="product-handle">
    <template>
      <!-- Product display logic here -->
      <shopify-media query="product.featuredImage"></shopify-media>
      <shopify-data query="product.title"></shopify-data>
      <shopify-money query="product.price"></shopify-money>
    </template>
  </shopify-context>
  
  <shopify-cart id="cart"></shopify-cart>
</shopify-store>
```

### Core Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `<shopify-store>` | Root configuration | Store credentials, market settings |
| `<shopify-context>` | Data binding | Product, collection, customer contexts |
| `<shopify-data>` | Content display | Text rendering with Liquid-like queries |
| `<shopify-media>` | Image/video display | Responsive images with srcset |
| `<shopify-money>` | Price formatting | Currency formatting with localization |
| `<shopify-cart>` | Shopping cart | Add/remove items, checkout integration |
| `<shopify-variant-selector>` | Product options | Size, color, style selection |

### Data Flow
1. **Store Configuration** → Sets up API credentials and market context
2. **Context Components** → Fetch data from Shopify APIs
3. **Display Components** → Render data with formatting and styling
4. **Interactive Components** → Handle user actions and state changes

## Theme Integration Limitations

### What Web Components CANNOT Do
- ❌ **Direct theme modification**: Cannot be embedded into `.liquid` files
- ❌ **Theme settings access**: Cannot use existing theme configuration
- ❌ **Liquid integration**: No access to Liquid variables or filters
- ❌ **Theme CSS inheritance**: Cannot directly use theme stylesheets

### What Web Components CAN Do
- ✅ **Standalone storefronts**: Complete replacement for theme functionality
- ✅ **Separate pages**: Custom pages linked from existing themes
- ✅ **External integrations**: Embedded widgets for other websites
- ✅ **Mobile applications**: React Native, Flutter, native app integration

## Hybrid Implementation Approaches

### Option 1: External Hosting + Theme Links (Recommended)

**Best for**: Complex features, custom product configurators, advanced collection pages

**Advantages**:
- Complete development freedom
- Modern build tools and workflows
- Independent deployment cycles
- Scalable hosting options

**Implementation**:
```bash
# Project structure
shopify-web-components-pages/
├── src/
│   ├── pages/
│   │   ├── product-configurator.html
│   │   ├── custom-collection.html
│   │   └── enhanced-cart.html
│   ├── components/
│   └── styles/
├── dist/
└── package.json
```

**Theme Integration**:
```liquid
<!-- In theme templates -->
<a href="https://your-domain.vercel.app/configurator?product={{ product.handle }}" 
   class="btn btn-primary">
  Advanced Product Configurator
</a>
```

### Option 2: App Proxy Pages

**Best for**: Seamless store integration, admin-managed content

**Setup**:
- Create Shopify app with proxy configuration
- Configure subpath: `/tools` or `/apps`
- Deploy Express/Node.js server

**Theme Integration**:
```liquid
<!-- Appears as part of store domain -->
<a href="/apps/tools/configurator">Product Configurator</a>
```

### Option 3: Theme Assets Integration

**Best for**: Simple components, direct theme embedding

**Implementation**:
```liquid
<!-- templates/page.web-components.liquid -->
<script type="module" src="https://cdn.shopify.com/storefront/web-components.js"></script>

<shopify-store store-domain="{{ shop.permanent_domain }}">
  <!-- Component implementation -->
</shopify-store>
```

## Development Workflows

### Local Development Setup

**1. Web Components Project**:
```bash
# Initialize project
mkdir shopify-components
cd shopify-components
npm init -y
npm install --save-dev vite

# Development server
npm run dev
```

**2. Theme Development**:
```bash
# Install Shopify CLI
npm install -g @shopify/cli

# Connect to store
shopify theme dev --store your-store.myshopify.com
```

**3. Build Configuration (vite.config.js)**:
```javascript
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        'configurator': 'src/pages/configurator.html',
        'collection': 'src/pages/collection.html'
      }
    }
  }
})
```

### Deployment Workflows

**External Hosting (Vercel)**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to staging
vercel

# Deploy to production
vercel --prod
```

**Theme Updates**:
```bash
# Push theme changes
shopify theme push

# Publish theme
shopify theme publish
```

### CI/CD Pipeline Example

```yaml
# .github/workflows/deploy.yml
name: Deploy Web Components
on:
  push:
    branches: [main]

jobs:
  deploy-components:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Implementation Examples

### Example 1: Product Configurator Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Configurator</title>
    <script type="module" src="https://cdn.shopify.com/storefront/web-components.js"></script>
    <style>
        .configurator {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }
        
        .product-preview {
            position: sticky;
            top: 2rem;
        }
        
        .configuration-panel {
            background: #f8f9fa;
            padding: 2rem;
            border-radius: 8px;
        }
        
        shopify-variant-selector::part(form) {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        shopify-variant-selector::part(radio-selected) {
            background: #0066cc;
            color: white;
        }
    </style>
</head>
<body>
    <shopify-store 
        store-domain="your-store.myshopify.com" 
        country="US" 
        language="en">
        
        <div class="configurator">
            <div class="product-preview">
                <shopify-context type="product" handle="configurable-product">
                    <template>
                        <shopify-media 
                            width="500" 
                            height="500" 
                            query="product.selectedOrFirstAvailableVariant.image">
                        </shopify-media>
                        
                        <h1><shopify-data query="product.title"></shopify-data></h1>
                        
                        <div class="price">
                            <shopify-money 
                                format="money_with_currency"
                                query="product.selectedOrFirstAvailableVariant.price">
                            </shopify-money>
                        </div>
                        
                        <div class="description">
                            <shopify-data query="product.descriptionHtml"></shopify-data>
                        </div>
                    </template>
                </shopify-context>
            </div>
            
            <div class="configuration-panel">
                <h2>Customize Your Product</h2>
                
                <shopify-context type="product" handle="configurable-product">
                    <template>
                        <shopify-variant-selector></shopify-variant-selector>
                        
                        <button 
                            class="add-to-cart-btn"
                            onclick="getElementById('cart').addLine(event).showModal();"
                            shopify-attr--disabled="!product.selectedOrFirstAvailableVariant.availableForSale">
                            Add to Cart - <shopify-money query="product.selectedOrFirstAvailableVariant.price"></shopify-money>
                        </button>
                    </template>
                </shopify-context>
            </div>
        </div>
        
        <shopify-cart id="cart">
            <div slot="checkout-button">Proceed to Secure Checkout</div>
        </shopify-cart>
    </shopify-store>
    
    <script>
        // Additional configuration logic
        document.addEventListener('DOMContentLoaded', function() {
            // Get product handle from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const productHandle = urlParams.get('product');
            
            if (productHandle) {
                // Update context to show specific product
                const context = document.querySelector('shopify-context[type="product"]');
                context.setAttribute('handle', productHandle);
            }
        });
    </script>
</body>
</html>
```

### Example 2: Enhanced Collection Grid

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Collection</title>
    <script type="module" src="https://cdn.shopify.com/storefront/web-components.js"></script>
    <style>
        .collection-page {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .collection-header {
            text-align: center;
            margin-bottom: 3rem;
        }
        
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .product-card {
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.2s ease;
        }
        
        .product-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .product-image {
            position: relative;
            overflow: hidden;
        }
        
        .product-info {
            padding: 1.5rem;
        }
        
        .product-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        
        .product-price {
            font-size: 1.2rem;
            color: #0066cc;
            font-weight: 700;
        }
        
        .quick-add-btn {
            width: 100%;
            padding: 0.75rem;
            background: #000;
            color: white;
            border: none;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s ease;
        }
        
        .quick-add-btn:hover {
            background: #333;
        }
    </style>
</head>
<body>
    <shopify-store 
        store-domain="your-store.myshopify.com" 
        country="US" 
        language="en">
        
        <div class="collection-page">
            <shopify-context type="collection" handle="featured-products">
                <template>
                    <div class="collection-header">
                        <h1><shopify-data query="collection.title"></shopify-data></h1>
                        <p><shopify-data query="collection.description"></shopify-data></p>
                    </div>
                </template>
            </shopify-context>
            
            <shopify-list-context type="product" query="collection.products" first="12">
                <template>
                    <div class="products-grid">
                        <div class="product-card">
                            <div class="product-image">
                                <shopify-media 
                                    width="300" 
                                    height="300" 
                                    query="product.featuredImage">
                                </shopify-media>
                            </div>
                            
                            <div class="product-info">
                                <h3 class="product-title">
                                    <shopify-data query="product.title"></shopify-data>
                                </h3>
                                
                                <div class="product-price">
                                    <shopify-money 
                                        format="money"
                                        query="product.priceRange.minVariantPrice">
                                    </shopify-money>
                                </div>
                                
                                <button 
                                    class="quick-add-btn"
                                    onclick="openProductModal(event)"
                                    data-product-handle="{{ product.handle }}">
                                    Quick Add
                                </button>
                            </div>
                        </div>
                    </div>
                </template>
            </shopify-list-context>
        </div>
        
        <!-- Product Modal -->
        <dialog id="product-modal" class="product-modal">
            <shopify-context id="modal-context" type="product" wait-for-update>
                <template>
                    <div class="modal-content">
                        <button class="close-btn" onclick="closeModal()">×</button>
                        
                        <div class="modal-layout">
                            <div class="modal-image">
                                <shopify-media 
                                    width="400" 
                                    height="400" 
                                    query="product.selectedOrFirstAvailableVariant.image">
                                </shopify-media>
                            </div>
                            
                            <div class="modal-details">
                                <h2><shopify-data query="product.title"></shopify-data></h2>
                                
                                <div class="modal-price">
                                    <shopify-money 
                                        format="money_with_currency"
                                        query="product.selectedOrFirstAvailableVariant.price">
                                    </shopify-money>
                                </div>
                                
                                <shopify-variant-selector></shopify-variant-selector>
                                
                                <button 
                                    class="add-to-cart-modal-btn"
                                    onclick="getElementById('cart').addLine(event).showModal(); closeModal();">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </template>
            </shopify-context>
        </dialog>
        
        <shopify-cart id="cart"></shopify-cart>
    </shopify-store>
    
    <script>
        function openProductModal(event) {
            const productHandle = event.target.getAttribute('data-product-handle');
            const modalContext = document.getElementById('modal-context');
            
            // Update modal context with selected product
            modalContext.setAttribute('handle', productHandle);
            modalContext.update(event);
            
            // Show modal
            document.getElementById('product-modal').showModal();
        }
        
        function closeModal() {
            document.getElementById('product-modal').close();
        }
    </script>
</body>
</html>
```

## Best Practices

### Performance Optimization
- **Lazy Loading**: Load components only when needed
- **Image Optimization**: Use appropriate `width` and `height` attributes
- **CDN Usage**: Leverage Shopify's CDN for web components library
- **Caching**: Implement proper cache headers for static assets

### SEO Considerations
- **Server-Side Rendering**: Consider SSR for critical content
- **Meta Tags**: Include proper meta descriptions and titles
- **Structured Data**: Add JSON-LD for product information
- **URL Structure**: Use semantic URLs for web component pages

### Security Best Practices
- **HTTPS Only**: Always serve over secure connections
- **API Token Management**: Secure storage of Shopify access tokens
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Input Validation**: Sanitize user inputs and parameters

### Development Guidelines
- **Component Isolation**: Keep components self-contained
- **Error Handling**: Implement graceful fallbacks
- **Loading States**: Show appropriate loading indicators
- **Mobile First**: Design for mobile devices primarily

## Resources

### Official Documentation
- [Storefront Web Components API Reference](https://shopify.dev/api/storefront-web-components)
- [Storefront Web Components Playground](https://webcomponents.shopify.dev/playground)
- [Shopify CLI Documentation](https://shopify.dev/docs/api/shopify-cli)

### Development Tools
- **Shopify CLI**: Local development and deployment
- **Vite**: Fast build tool for modern web development
- **Vercel/Netlify**: Static site hosting platforms
- **Theme Inspector**: Chrome extension for Shopify development

### Community Resources
- [Shopify Developer Community](https://community.shopify.dev/)
- [Shopify GitHub Examples](https://github.com/Shopify)
- [Web Components Standards](https://www.webcomponents.org/)

### Related Technologies
- **Hydrogen**: Shopify's full-stack React framework
- **Storefront API**: GraphQL API for custom storefronts
- **Theme App Extensions**: App integration with themes
- **Liquid Templates**: Shopify's templating language

---

*Last Updated: [Current Date]*
*Version: 1.0*