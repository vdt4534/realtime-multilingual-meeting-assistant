Implementation Plan Overview
Phase 1: Infrastructure Setup (Days 1-3)

Set up development environment
Create Shopify development store
Initialize custom app
Set up Vercel project
Configure API access

Phase 2: Validation System (Days 4-7)

Build corporate ID validation
Create validation endpoints
Implement caching layer
Set up error handling

Phase 3: Registration System (Days 8-12)

Create app proxy registration form
Build admin dashboard for management
Implement form validation
Build customer creation flow
Add metafield storage

Phase 4: Access Control (Days 13-16)

Install and configure Locksmith
Set up customer tagging
Create redirect flows
Test access scenarios

Phase 5: Integration & Testing (Days 17-20)

End-to-end testing
Performance optimization
Error handling refinement
Documentation


task.md
markdown# Valrhona Japan B2B Sample Portal - Implementation Tasks

## Instructions for LLM Coder
- Work through tasks sequentially
- Check off completed tasks with [x]
- When a test is required, pause and instruct the user
- All UI text must be in Japanese
- Code comments and variable names should be in English
- Ask for clarification if any requirement is unclear

## Phase 1: Infrastructure Setup

### Day 1: Development Environment

- [ ] Create a new Shopify development store
  - Store name: valrhona-japan-b2b-dev
  - Enable customer accounts (new customer accounts)
  - Set timezone to Japan (JST)
  
- [ ] Install Shopify CLI on local machine
User Test Required:

Run shopify version to verify installation
Run shopify auth login to authenticate
Confirm you can see the development store in the list


- [ ] Create GitHub repository
- Repository name: valrhona-japan-b2b-portal
- Initialize with README
- Add .gitignore for Node.js

### Day 2: Shopify App Initialization

- [ ] Generate new Shopify app using CLI
Command: shopify app init
App name: Valrhona B2B Portal
Language: JavaScript/React

- [ ] Configure app permissions in shopify.app.toml
- read_customers
- write_customers  
- read_orders (for future sample tracking)
- write_app_proxy (for public registration form)

- [ ] Create metafield definitions setup file
- File: config/metafields.json
- Include all B2B validation fields

- [ ] Test app installation
User Test Required:

Run shopify app dev
Install app on development store
Verify app appears in admin
Check that requested scopes are granted


### Day 3: External Infrastructure

- [ ] Create Vercel account and project
- Project name: valrhona-b2b-validation
- Framework: Next.js (API routes only)

- [ ] Set up Japanese Corporate Registry API access
- Apply for API token at https://info.gbiz.go.jp/
- Document the application process
- Store token securely (do not commit)

- [ ] Create environment variables structure
- .env.local for development
- Document all required variables
- Set up Vercel environment variables

## Phase 2: Validation System

### Day 4: Corporate ID Validation Endpoint

- [ ] Create Vercel API endpoint structure
- /api/validate/corporate-id
- /api/validate/wholesaler-code
- /api/validate/health (for monitoring)

- [ ] Implement corporate ID validation logic
- Input sanitization
- Format validation (13 digits)
- API call to gbiz.go.jp
- Response parsing

- [ ] Add error handling
- API timeout (5 seconds)
- Invalid token
- Rate limiting
- Network errors

- [ ] Test corporate ID validation
User Test Required:

Test with valid ID: 1010001000001
Test with invalid ID: 123
Test with malformed ID: ABCDEFGHIJKLM
Verify response format matches expected structure


### Day 5: Wholesaler Code System

- [ ] Design wholesaler code structure
- Format: XXXX-YYYY-ZZZZ
- Storage: Shopify metafields on shop
- Rotation strategy documentation

- [ ] Create wholesaler code validation
- Code format validation
- Expiration checking
- Usage limit checking
- Active status verification

- [ ] Build admin interface for code management
- List all codes
- Add new codes
- Deactivate codes
- View usage statistics

### Day 6: Caching Layer

- [ ] Implement Redis caching on Vercel
- Corporate ID results (24 hour TTL)
- Wholesaler code status (1 hour TTL)

- [ ] Create cache invalidation strategy
- Manual invalidation endpoint
- Automatic expiration
- Cache warming strategy

- [ ] Performance testing
User Test Required:

Time validation with cold cache
Time validation with warm cache
Verify cache hit rate > 80%
Test cache invalidation


### Day 7: Validation System Integration

- [ ] Create unified validation endpoint
- Combines corporate ID + wholesaler code
- Returns business type determination
- Includes company data for prefill

- [ ] Add comprehensive logging
- Validation attempts
- Success/failure rates
- Response times
- Error details

- [ ] Create monitoring dashboard
- Validation success rate
- Average response time
- Error frequency
- Cache performance

## Phase 3: Registration System

### Day 8: App Proxy Registration Form

- [ ] Create app proxy endpoint in Vercel
- Route: /app_proxy 
- Public URL: /apps/b2b-registration
- Configure Shopify signature verification

- [ ] Build form structure with all fields:
- 法人番号 (Corporate Number)
- 姓 (Surname)
- 名 (First Name) 
- 姓（カタカナ）(Surname Katakana)
- 名（カタカナ）(First Name Katakana)
- メールアドレス (Email)
- 電話番号 (Phone)
- 郵便番号 (Postal Code)
- 都道府県 (Prefecture)
- 市区町村 (City)
- 住所 (Address)
- 住所2 (Address 2)
- 業種 (Business Type) - Dropdown
- 職種 (Function) - Dropdown
- 興味のある製品 (Products of Interest) - Multi-select
- 興味のあるチョコレート (Chocolate Interest) - Multi-select
- 興味のある追加材料 (Additional Ingredients) - Multi-select
- 店舗名 (Store Name)
- ウェブサイト (Website)
- ニュースレター購読 (Newsletter Subscription) - Checkbox

- [ ] Implement Japanese form helpers
- Postal code → Address autofill
- Katakana input validation
- Phone number formatting

### Day 9: Form Validation & UX

- [ ] Implement real-time validation
- Corporate number validation on blur
- Email format validation
- Required field checking
- Katakana format validation

- [ ] Add loading states
- During corporate ID validation
- During form submission
- Inline validation indicators

- [ ] Create error messaging
- Field-level errors in Japanese
- General error messages
- Success confirmations

- [ ] Test form UX
User Test Required:

Fill form with valid data - should succeed
Submit without required fields - should show errors
Enter invalid corporate number - should show specific error
Test on mobile device - should be responsive


### Day 10: Customer Creation Flow

- [ ] Build customer creation mutation
- Map form fields to customer fields
- Create metafields for B2B data
- Handle multi-select field storage

- [ ] Implement metafield structure:
namespace: "b2b_validation"

corporate_number
business_type
function
validation_status
validation_date
wholesaler_code

namespace: "b2b_preferences"

products_interest (JSON)
chocolate_interest (JSON)
ingredients_interest (JSON)


- [ ] Add customer tags
- b2b_validated
- business_type:{type}
- pending_review (if validation fails)

### Day 11: Auto-login Implementation

- [ ] Integrate Customer Account API
- Configure OAuth endpoints
- Set up callback handling
- Implement token management

- [ ] Create seamless login flow
- After successful registration
- Redirect to intended page
- Show welcome message

- [ ] Handle edge cases
- Existing email address
- Failed auto-login
- Session timeout

### Day 12: Admin Dashboard for Registration Management

- [ ] Create admin dashboard in Shopify app
- List all B2B registrations with metafields
- Show validation status and customer details
- Allow manual approval/rejection of registrations

- [ ] Build notification system
- Email to admin on failed validation
- Email to customer on approval
- Daily summary of pending reviews

- [ ] Test manual review flow
User Test Required:

Register with invalid corporate number
Verify appears in admin queue
Manually approve registration
Verify customer can now login


## Phase 4: Access Control

### Day 13: Locksmith Installation & Configuration

- [ ] Install Locksmith app
- Configure basic settings
- Set up API access

- [ ] Create lock for entire store
- Name: "B2B Validated Customers Only"
- Default state: Locked

- [ ] Configure key conditions
- Customer tag contains "b2b_validated"
- Customer metafield validation_status = "approved"

### Day 14: Locksmith Exception Configuration for App Proxy

- [ ] Configure Locksmith exceptions for app proxy
- Allow access to /apps/b2b-registration
- Allow access to /apps/b2b-registration/*
- Maintain cart during registration process
- Add company information

- [ ] Configure Locksmith exceptions
- Allow access to registration page
- Allow access to registration assets
- Maintain cart during registration

- [ ] Style registration page
- Match Valrhona brand guidelines
- Mobile responsive design
- Clear call-to-action

### Day 15: Access Denied Experience

- [ ] Customize Locksmith messages
- Access denied message in Japanese
- Redirect to registration
- Contact information for support

- [ ] Create help documentation
- Registration guide
- FAQ section
- Troubleshooting steps

- [ ] Test access control
User Test Required:

Visit store without account - should redirect
Visit with non-validated account - should deny
Visit with validated account - should allow
Test deep links maintain redirect


### Day 16: Integration Testing

- [ ] Full flow testing scenarios:
1. New valid customer registration
2. Invalid corporate number handling
3. Existing customer attempting registration
4. Manual approval process
5. Auto-login after registration

- [ ] Performance testing
User Test Required:

Measure registration time (< 10 seconds)
Test with 10 concurrent registrations
Verify no data loss under load
Check validation endpoint response times


## Phase 5: Polish & Deployment

### Day 17: Error Handling & Edge Cases

- [ ] Implement comprehensive error handling
- Network failures
- API timeouts
- Invalid data formats
- Concurrent registration attempts

- [ ] Add retry logic
- Failed API calls
- Customer creation failures
- Auto-login failures

- [ ] Create error tracking
- Sentry or similar integration
- Error categorization
- Alert thresholds

### Day 18: Analytics & Monitoring

- [ ] Implement analytics tracking
- Registration attempts
- Success rate
- Drop-off points
- Validation failure reasons

- [ ] Create admin dashboard
- Registration metrics
- Business type breakdown
- Geographic distribution
- Popular product interests

- [ ] Set up alerts
- High failure rate
- API endpoint down
- Unusual activity patterns

### Day 19: Documentation

- [ ] Create user documentation
- Registration guide (Japanese)
- FAQ (Japanese)
- Troubleshooting (Japanese)

- [ ] Write technical documentation
- API endpoints
- Data structures
- Deployment process
- Maintenance procedures

- [ ] Record admin training videos
- Managing wholesaler codes
- Reviewing pending registrations
- Viewing analytics

### Day 20: Deployment Preparation

- [ ] Security audit
- API token storage
- Data encryption
- Access control verification
- GDPR compliance check

- [ ] Create deployment checklist
- Environment variables
- API endpoints
- DNS configuration
- SSL certificates

- [ ] Final testing
User Test Required:

Complete registration on staging
Verify all emails sent correctly
Test on multiple devices/browsers
Confirm analytics tracking working
Validate backup/recovery procedures


- [ ] Prepare rollback plan
- Database backup
- Code version tagging
- Rollback procedures
- Communication plan

## Post-Launch Tasks

- [ ] Monitor first 48 hours
- Error rates
- Registration success
- Performance metrics
- User feedback

- [ ] Daily tasks for first week
- Review pending registrations
- Check error logs
- Monitor performance
- Gather user feedback

- [ ] Weekly optimization
- Analyze drop-off points
- Optimize slow queries
- Update documentation
- Plan improvements

## Notes for LLM Coder

1. Always use Japanese for user-facing text
2. Maintain English for code and internal documentation
3. Test each component thoroughly before moving on
4. Ask for clarification on business logic when needed
5. Prioritize security and data privacy
6. Keep detailed logs of all decisions made
