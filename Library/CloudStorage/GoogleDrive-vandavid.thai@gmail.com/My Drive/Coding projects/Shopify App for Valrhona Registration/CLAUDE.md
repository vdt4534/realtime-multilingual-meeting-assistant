# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a B2B customer validation and registration system for Valrhona Japan's Shopify store. The system validates Japanese corporate registry information and restricts store access to validated business customers only.

## IMPORTANT: 
1. Always refer to the latest documentation about shopify using the shopify-dev-document-mcp server. It is the most up to date documentation. After doing a search on the server, make sure to compile the findings into the @shopify-api-doc.md file. So we can use the latest documentation to build the app.
2. Use the latest Shopify CLI and Shopify App Bridge, and Polaris React
3. The @form-required.txt file contains the required fields for the registration form. Make sure to use the latest version of the file when making the registration form.
4. The @gBiz.go.jp-api-doc.md file contains the API documentation for the Japanese Corporate Registry API. Make sure to use the latest version of the file when making the validation system.
5. The @super-detailed-implementation-plan.md file contains the super detailed implementation plan. Make sure to use the latest version of the file when making the app.

## WORKFLOW
Always follow the @task.md file and complete tasks one by one. When you finish one task mark it as [x]. so you can work on the next task.


## Architecture

The system consists of:
- **Shopify Custom App**: Registration form and customer management
- **Vercel Edge Functions**: Server-side proxy for Japanese Corporate Registry API (gbiz.go.jp)
- **Locksmith App**: Third-party access control for entire Shopify store
- **Customer Account API**: Passwordless authentication

## Key Technical Stack

- **Platform**: Shopify (Standard plan)
- **Framework**: Shopify App (Remix-based) with JavaScript/React
- **External Infrastructure**: Vercel Edge Functions
- **Authentication**: Shopify Customer Account API
- **Access Control**: Locksmith App (third-party)
- **External API**: Japanese Corporate Registry (gbiz.go.jp) - requires server-side proxy due to CORS restrictions

## Development Commands

Current development environment status:
- Node.js 22.14.0 ✓
- npm 10.9.2 ✓ 
- Shopify CLI 3.81.0 ✓

```bash
# Shopify app development
shopify app dev

# Shopify CLI installation (completed)
npm install -g @shopify/cli

# Shopify app initialization (correct command verified)
shopify app init

# Vercel deployment (when implemented)
vercel dev
vercel deploy
```

## Current Implementation Status

**Phase 1: Infrastructure Setup - COMPLETE**
- [x] Verify development environment (Node.js, npm)
- [x] Install Shopify CLI globally
- [x] Generate new Shopify app using CLI with Remix template
- [x] Basic Shopify app structure created (valrhona-b2-b-registration)
- [x] Configure app permissions in shopify.app.toml (B2B customer scopes: read_customers, write_customers, read_orders)
- [x] Create GitHub repository (valrhona-japan-b2b-portal)
- [x] Test app installation with corrected scopes
- [x] Create Vercel project structure for validation API proxy
- [ ] Apply for Japanese Corporate Registry API token (pending - requires business application)

**Phase 2: Validation System - IN PROGRESS**
- [x] Create separate Vercel repository (valrhona-b2b-validation)
- [x] Setup basic API structure with CORS proxy
- [x] Implement mock corporate ID validation endpoint
- [ ] Get gBizINFO API token and integrate real validation
- [ ] Create wholesaler code validation system
- [ ] Setup Redis caching layer

**Shopify App Details:**
- App ID: 7fbfbd44e8f1b964330ee9f9c0b23c6c
- App Name: Valrhona-B2B-registration
- Framework: Remix v2.16.1 with Polaris v12
- Database: Prisma with SQLite (production ready)
- Current Scopes: read_customers, write_customers, read_orders (correct B2B scopes)
- Repository: https://github.com/vdt4534/valrhona-japan-b2b-portal

**Validation API Details:**
- Repository: https://github.com/vdt4534/valrhona-b2b-validation
- Runtime: Vercel Node.js functions
- CORS: Configured for cross-origin requests
- Endpoints: /api/validate/corporate-id, /api/validate/health

## Data Architecture

### Customer Metafields Structure
```
namespace: "b2b_validation"
- corporate_number: 13-digit Japanese corporate number (法人番号)
- business_type: Business category from predefined list
- function: Job function from predefined list  
- validation_status: "pending" | "approved" | "rejected"
- validation_date: ISO date string
- wholesaler_code: Internal validation code

namespace: "b2b_preferences" 
- products_interest: JSON array of product interests
- chocolate_interest: JSON array of chocolate preferences
- ingredients_interest: JSON array of ingredient preferences
```

### Customer Tags
- `b2b_validated`: Primary access control tag
- `business_type:{type}`: For customer segmentation
- `pending_review`: Manual review queue marker

## Critical Implementation Notes

### API Integration Requirements
- **Japanese Corporate Registry API**: Must use server-side proxy (Vercel) due to CORS restrictions
- **API Token**: Stored securely in Vercel environment variables, never exposed client-side
- **Response Caching**: 24-hour TTL for corporate validation results

### Validation Flow
1. Customer enters 13-digit corporate number (法人番号)
2. Real-time validation via Vercel proxy to gbiz.go.jp
3. Company data prefill from registry response
4. Customer completes comprehensive registration form (20+ fields)
5. Shopify customer created with metafields and tags
6. Locksmith grants/denies store access based on validation status

### Security Considerations
- API tokens stored only in Vercel environment variables
- Request signing for Shopify webhooks
- Minimal data storage approach
- Regular security audits required

## Japanese Corporate Registry API (gbiz.go.jp)

### Authentication
```javascript
headers: {
  'X-hojinInfo-api-token': process.env.API_KEY,
  'Accept': 'application/json'
}
```

### Endpoints
- `GET /api/v1/hojin/{corporateNumber}`: Basic corporate information
- Rate limiting: Implement 1-second delays between requests
- Response includes: company name, address, postal code, phonetic reading

### Important CORS Limitation
- Direct browser calls are blocked by CORS policy
- Must use server-side proxy for all web integrations
- Frontend JavaScript cannot make direct API calls

## Registration Form Fields

### Required Business Validation
- Corporate number (法人番号): 13-digit validation
- Wholesaler code: Internal validation system

### Customer Information (Japanese)
- Surname/First name (Kanji and Katakana)
- Contact details (email, phone, full address)
- Business type (dropdown with 33+ options)
- Job function (dropdown with 12+ options)
- Product interests (multi-select)
- Chocolate preferences (multi-select)
- Additional ingredients (multi-select)

### Form Features
- Progressive validation with inline feedback
- Postal code → address auto-lookup
- Katakana input validation
- Real-time corporate number validation

## Access Control Strategy

### Locksmith Configuration
- Entire store locked by default
- Exception: Public registration page (/pages/b2b-registration)
- Unlock condition: Customer has `b2b_validated` tag AND validation_status = "approved"

### Manual Review Queue
- Failed validations tagged as `pending_review`
- Admin interface for approval/rejection
- Email notifications for status changes

### Key Performance Targets
- Registration completion rate > 80%
- Validation response time < 500ms
- System uptime > 99.9%

## Development Guidelines

### Language Requirements
- **User-facing text**: Japanese only
- **Code comments and variables**: English only
- **Documentation**: English (internal), Japanese (user-facing)

### Testing Requirements
- Pause for user testing at each major milestone
- Test scenarios include validation edge cases and concurrent registrations
- Mobile responsiveness required

### Business Context
- Reduces manual processing from 1.5 FTE to 0.2 FTE
- Enables direct B2B relationships with small/medium Japanese businesses
- Automates sample ordering process for Valrhona Japan

## Implementation Plan Structure

The project follows a 20-day sequential implementation plan:

1. **Phase 1: Infrastructure Setup (Days 1-4)** - Development environment, Shopify app, Vercel setup
2. **Phase 2: Validation System (Days 3-6)** - Corporate ID validation, wholesaler codes, caching
3. **Phase 3: Registration System (Days 7-12)** - App proxy form, admin dashboard, validation, customer creation, auto-login
4. **Phase 4: Access Control System (Days 13-16)** - Locksmith configuration, testing
5. **Phase 5: Admin Interface & Management (Days 17-19)** - Review queue, analytics, documentation
6. **Phase 6: Deployment & Go-Live (Days 20-21)** - Security audit, final testing, production deployment

## Key Technical Discoveries

- Shopify CLI command is `shopify app init` (not `npm init @shopify/app@latest`)
- Authentication occurs automatically during app initialization
- Remix template with JavaScript is the recommended approach
- Development store must enable "new customer accounts" for Customer Account API
- Form requires 20+ fields including Japanese business validation (see form-required.txt)
- gBizINFO API requires server-side proxy due to CORS restrictions
- **Scope Fix**: Invalid metafield scopes (read_metafields, write_metafields) don't exist - use resource-specific scopes instead
- **Separate Repositories**: Shopify app and Vercel API require separate GitHub repositories for different deployment targets
- **B2B Customer Management**: Requires read_customers, write_customers, read_orders scopes for full functionality
- **App Proxy Architecture**: Registration form must be public-facing via app proxy, not admin app extension
- **Admin Dashboard Purpose**: Shopify app should be merchant dashboard for managing registrations, not customer registration form

## Shopify App Structure

The generated app includes:
- **Remix framework**: Latest v2.16.1 with Vite build system
- **Database**: Prisma ORM with SQLite (production ready)
- **Authentication**: Built-in OAuth and webhook handling
- **UI Framework**: Shopify Polaris v12 for admin interface
- **Extensions support**: Workspace configuration for app extensions
- **Development tools**: ESLint, Prettier, TypeScript support

**Key Files:**
- `shopify.app.toml`: App configuration and permissions
- `app/shopify.server.js`: Shopify API authentication setup
- `prisma/schema.prisma`: Database schema (currently has Session table)
- `app/routes/`: Remix routes for app pages and webhooks
- `extensions/`: Directory for Shopify app extensions

**Completed Updates:**
1. ✅ Configure correct B2B scopes in shopify.app.toml (read_customers, write_customers, read_orders)
2. ✅ Create metafield definitions structure (config/metafields.json)
3. ✅ Set up separate Vercel repository for API proxy
4. ✅ Fix scope validation errors and test app deployment
5. ✅ Create Vercel validation endpoints (corporate-id, wholesaler-code, health)
6. ✅ Deploy Vercel API successfully

**ARCHITECTURE CORRECTION REQUIRED:**
1. ❌ Current registration form is in admin app (incorrect)
2. ✅ Need to add write_app_proxy scope to shopify.app.toml
3. ✅ Need to configure app proxy in Partner Dashboard
4. ✅ Need to create app proxy endpoint in Vercel (/app_proxy)
5. ✅ Need to convert admin app to B2B management dashboard
6. ✅ Need to implement public registration form via app proxy

**Next Steps:**
1. Add write_app_proxy scope to shopify.app.toml
2. Configure app proxy in Partner Dashboard
3. Create app proxy endpoint serving registration form
4. Convert admin app to management dashboard
5. Apply for gBizINFO API token (business application required)
6. Setup Redis caching layer for performance