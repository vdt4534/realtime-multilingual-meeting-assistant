# Shopify API Documentation - Valrhona B2B Registration

## Architecture Overview

Based on Shopify documentation research, the correct architecture is:

### 1. **App Proxy** (Public Registration Form)
- **URL**: `https://store.com/apps/b2b-registration` 
- **Purpose**: Public-facing registration form for potential B2B customers
- **Technology**: App proxy forwarding to Vercel/external server
- **Content**: Japanese B2B registration form with 20+ fields

### 2. **Admin App** (Management Dashboard)  
- **URL**: Shopify admin embedded app
- **Purpose**: Merchant dashboard to manage B2B registrations
- **Technology**: Remix app with Polaris UI components
- **Features**: View registrations, approve/reject, manage wholesaler codes

### 3. **Validation API** (Backend Processing)
- **URL**: Vercel Edge Functions  
- **Purpose**: Corporate ID validation, wholesaler codes, customer creation
- **Technology**: Node.js serverless functions

## App Proxy Configuration

Based on Shopify docs `/docs/apps/build/online-store/display-dynamic-data`:

### Partner Dashboard Settings:
- **Subpath Prefix**: `apps`
- **Subpath**: `b2b-registration` 
- **Proxy URL**: `https://valrhona-b2b-validation.vercel.app/app_proxy`

### Example URLs:
- **Public Form**: `https://testing-valrhona.myshopify.com/apps/b2b-registration`
- **Forwarded To**: `https://valrhona-b2b-validation.vercel.app/app_proxy`

### Required Scope:
- `write_app_proxy` - Must be added to `shopify.app.toml`

## App Proxy Request Handling

Shopify forwards requests with these parameters:
- `shop`: The myshopify.com domain  
- `logged_in_customer_id`: ID of logged-in customer (if any)
- `path_prefix`: The proxy sub-path prefix (`/apps/b2b-registration`)
- `timestamp`: Unix timestamp
- `signature`: HMAC-SHA256 signature for verification

### Request Signature Verification:
```javascript
// Required for security - verify requests from Shopify
const crypto = require('crypto');

function verifyShopifySignature(query, secret) {
  const { signature, ...params } = query;
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('');
  
  const calculatedSignature = crypto
    .createHmac('sha256', secret)
    .update(sortedParams)
    .digest('hex');
    
  return signature === calculatedSignature;
}
```

## Admin App Dashboard Structure

### Pages Required:
1. **Dashboard Home** (`/app`) - Overview of registrations
2. **Registration List** (`/app/registrations`) - View all B2B registrations  
3. **Registration Detail** (`/app/registrations/:id`) - Individual registration management
4. **Wholesaler Codes** (`/app/wholesaler-codes`) - Manage access codes

### Polaris Components:
- `Page` - Page wrapper
- `Layout` - Grid layout system
- `Card` - Content containers
- `DataTable` - Registration listings
- `Badge` - Status indicators (pending, approved, rejected)
- `Button` - Actions (approve, reject, edit)
- `EmptyState` - No registrations state

### App Bridge Components:
- `<ui-title-bar>` - Page titles with actions
- `<ui-nav-menu>` - Navigation between pages

## Customer Creation with Metafields

### GraphQL Mutation:
```graphql
mutation customerCreate($input: CustomerInput!) {
  customerCreate(input: $input) {
    customer {
      id
      email
      firstName
      lastName
      tags
      metafields(first: 10) {
        edges {
          node {
            namespace
            key
            value
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

### Required Customer Input:
```javascript
const customerInput = {
  firstName: formData.firstName,
  lastName: formData.surname,
  email: formData.email,
  phone: formData.phone,
  addresses: [{
    address1: formData.address,
    city: formData.city,
    province: formData.prefecture,
    zip: formData.postalCode,
    country: "Japan"
  }],
  tags: ["b2b_customer", "pending_validation"],
  metafields: [
    {
      namespace: "b2b_validation",
      key: "corporate_number", 
      value: corporateData.corporateNumber,
      type: "single_line_text_field"
    },
    {
      namespace: "b2b_validation",
      key: "business_type",
      value: formData.businessType,
      type: "single_line_text_field" 
    },
    {
      namespace: "b2b_validation",
      key: "validation_status",
      value: "pending",
      type: "single_line_text_field"
    }
    // ... additional metafields
  ]
};
```

## Access Scopes Required

### Current Scopes:
```toml
scopes = "read_customers,write_customers,read_orders,write_app_proxy"
```

### Additional Scopes Needed:
- `write_app_proxy` - For app proxy functionality
- `read_metafields` - Read customer metafields (if needed)
- `write_metafields` - Write customer metafields (if needed)

Note: Customer metafields are accessed through customer scopes, not dedicated metafield scopes.

## Japanese Corporate Registry Integration

### gBizINFO API:
- **Endpoint**: `https://info.gbiz.go.jp/api/v1/hojin/{corporateNumber}`
- **Authentication**: `X-hojinInfo-api-token` header
- **CORS Issue**: Must use server-side proxy (Vercel)
- **Rate Limiting**: 1-second delays between requests recommended

### Corporate Number Validation:
- **Format**: Exactly 13 digits
- **Example**: `1234567890123`
- **Validation**: Regex `/^\d{13}$/`

## Security Considerations

### App Proxy Security:
- **Signature Verification**: Always verify HMAC signatures from Shopify
- **HTTPS Only**: All endpoints must use HTTPS
- **Input Validation**: Sanitize all form inputs
- **CORS Headers**: Properly configured for cross-origin requests

### Data Protection:
- **API Keys**: Store in environment variables only
- **Customer Data**: Encrypt sensitive information
- **Session Management**: Use query parameters (cookies stripped by Shopify)

## Implementation Steps

### Phase 1: App Proxy Setup
1. Add `write_app_proxy` scope to `shopify.app.toml`
2. Configure app proxy in Partner Dashboard
3. Create Vercel endpoint `/app_proxy` 
4. Implement signature verification
5. Create public registration form

### Phase 2: Admin Dashboard
1. Replace current registration form with admin dashboard
2. Implement customer listing with metafields
3. Add approval/rejection workflow
4. Create wholesaler code management

### Phase 3: Integration
1. Connect app proxy to customer creation
2. Test end-to-end registration flow
3. Implement email notifications
4. Add analytics and reporting

## Key Shopify Documentation References

- [App Proxies](https://shopify.dev/apps/build/online-store/display-dynamic-data)
- [GraphQL Admin API - Customers](https://shopify.dev/docs/api/admin-graphql/latest/objects/customer)
- [Customer Registration Templates](https://shopify.dev/storefronts/themes/architecture/templates/customers-register)
- [Polaris Design System](https://polaris.shopify.com/)
- [App Bridge](https://shopify.dev/docs/api/app-bridge)
- [Remix App Package](https://shopify.dev/docs/api/shopify-app-remix)

## Current Implementation Issues

### Problem:
- Registration form created in admin app (wrong location)
- Should be public storefront form via app proxy
- Admin app should be management dashboard only

### Solution:
- Move registration form to app proxy endpoint
- Convert admin app to management dashboard
- Maintain Vercel API for validation and processing