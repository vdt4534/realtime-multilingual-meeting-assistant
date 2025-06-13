# Valrhona Japan B2B Portal - Super Detailed Implementation Plan

## Overview
This plan creates a B2B customer validation and registration system for Valrhona Japan's Shopify store, integrating Japanese Corporate Registry validation, automated customer creation, and access control.

## Architecture Summary
- **Public Registration Form**: App Proxy (Vercel-hosted) at /apps/b2b-registration
- **Admin Dashboard**: Shopify Remix App for merchant management
- **Validation API**: Vercel Edge Functions (CORS proxy for gBizINFO API)
- **Authentication**: Shopify Customer Account API (passwordless)
- **Access Control**: Locksmith App (third-party)
- **Data Storage**: Shopify Customer Metafields

---

## PHASE 1: FOUNDATION & INFRASTRUCTURE (Days 1-4)

### 1.1 Development Environment Setup
**Day 1 - Morning (2-3 hours)**

**Sub-tasks:**
1. **Create Shopify Development Store**
   - Store name: `valrhona-japan-b2b-dev`
   - Region: Japan 
   - Currency: JPY
   - Timezone: JST (UTC+9)
   - Enable customer accounts (new customer accounts API)
   - Language: Japanese primary, English secondary

2. **Install Shopify CLI**
   - Download from shopify.dev/docs/apps/tools/cli
   - Install globally: `npm install -g @shopify/cli @shopify/theme`
   
   **USER ACTION REQUIRED:**
   - Run `shopify version` to verify installation
   - Run `shopify auth login` and authenticate with partner account
   - Confirm development store appears in list with `shopify app list`

3. **Setup Development Machine**
   - Install Node.js 18+ and npm
   - Install Git and configure
   - Setup code editor with Shopify extensions

**Day 1 - Afternoon (3-4 hours)**

### 1.2 Repository & Version Control
**Sub-tasks:**
1. **Create GitHub Repository**
   - Repository name: `valrhona-japan-b2b-portal`
   - Initialize with README and .gitignore (Node.js template)
   - Create development branch
   - Setup branch protection rules

2. **Initialize Shopify App**
   ```bash
   POLARIS_UNIFIED=true shopify app init
   ```
   - App name: "Valrhona B2B Portal"
   - Select: "Build a Remix app (recommended)"
   - Select: "JavaScript (Polaris Early Access)"
   - Template: Latest Remix template

3. **Configure App Permissions in shopify.app.toml**
   ```toml
   [access_scopes]
   scopes = "read_customers,write_customers,read_orders,write_app_proxy"
   
   [admin_api]
   direct_api_mode = "online"
   embedded_app_home = true
   
   [app_proxy]
   url = "https://valrhona-b2b-validation.vercel.app/app_proxy"
   subpath = "b2b-registration"
   prefix = "apps"
   ```

### 1.3 External Infrastructure Setup
**Day 2 - Full Day (6-8 hours)**

**Sub-tasks:**
1. **Vercel Project Setup**
   - Create Vercel account (if needed)
   - Project name: `valrhona-b2b-validation`  
   - Connect to GitHub repository
   - Select Next.js framework preset
   - Deploy initial empty project

2. **Japanese Corporate Registry API Access**
   
   **USER ACTION REQUIRED:**
   - Apply for gBizINFO API token at https://info.gbiz.go.jp/
   - Complete application form (requires Japanese business details)
   - Wait for approval (typically 1-3 business days)
   - Once approved, store API token securely

3. **Environment Variables Structure**
   
   Create `.env.local` for development:
   ```env
   # Shopify App Configuration
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   SHOPIFY_APP_URL=https://your-app.vercel.app
   
   # gBizINFO API
   GBIZ_API_TOKEN=your_gbiz_token
   GBIZ_API_BASE_URL=https://info.gbiz.go.jp/api/v1
   
   # Database/Cache (Redis)
   REDIS_URL=your_redis_url
   
   # Security
   WEBHOOK_SECRET=your_webhook_secret
   JWT_SECRET=your_jwt_secret
   ```

4. **Test App Installation**
   
   **USER ACTION REQUIRED:**
   - Run `shopify app dev` in project directory
   - Install app on development store
   - Verify app appears in Shopify admin
   - Confirm all requested scopes are granted
   - Test basic GraphQL query functionality

---

## PHASE 2: VALIDATION SYSTEM (Days 3-6)

### 2.1 Corporate ID Validation Endpoint
**Day 3 - Full Day (6-8 hours)**

**Sub-tasks:**
1. **Create Vercel API Structure**
   ```
   /api
     /validate
       corporate-id.js
       wholesaler-code.js
       health.js
     /utils
       gbiz-client.js
       validation-helpers.js
       cache-manager.js
   ```

2. **Implement Corporate ID Validation Logic**
   - Input sanitization (remove hyphens, spaces)
   - Format validation (exactly 13 digits)
   - Checksum validation (if applicable)
   - API call to gBizINFO with proper headers
   - Response parsing and normalization

3. **Corporate ID Validation Flow:**
   ```javascript
   // /api/validate/corporate-id.js
   export default async function handler(req, res) {
     // 1. Validate request method and input
     // 2. Sanitize corporate number
     // 3. Check cache first
     // 4. Call gBizINFO API
     // 5. Parse response
     // 6. Cache result
     // 7. Return normalized data
   }
   ```

4. **Error Handling Implementation**
   - API timeout (5 seconds)
   - Invalid/expired token
   - Rate limiting detection
   - Network errors
   - Malformed responses
   - Cache failures

5. **Response Format Standardization**
   ```javascript
   {
     success: boolean,
     data: {
       corporateNumber: string,
       companyName: string,
       companyNameKana: string,
       postalCode: string,
       address: string,
       isValid: boolean,
       lastUpdated: string
     },
     error: string | null,
     cached: boolean
   }
   ```

**USER ACTION REQUIRED - Day 3 End:**
- Test with valid corporate number: `1010001000001`
- Test with invalid number: `123`  
- Test with malformed input: `ABCDEFGHIJKLM`
- Verify response format matches specification

### 2.2 Wholesaler Code System
**Day 4 - Full Day (6-8 hours)**

**Sub-tasks:**
1. **Design Wholesaler Code Structure**
   - Format: `VALR-YYYY-XXXX` (VALR prefix, year, 4-digit sequence)
   - Example: `VALR-2024-0001`
   - Storage: Shopify Shop metafields
   - Expiration: 1 year from issue date
   - Usage tracking: Count and customer association

2. **Create Metafield Definitions for Wholesaler Codes**
   ```javascript
   // Shopify metafield definitions
   {
     namespace: "wholesaler_system",
     key: "active_codes",
     type: "json",
     description: "Active wholesaler validation codes"
   }
   ```

3. **Wholesaler Code Validation Endpoint**
   ```javascript
   // /api/validate/wholesaler-code.js
   // 1. Format validation
   // 2. Fetch from Shopify metafields
   // 3. Check expiration
   // 4. Verify usage limits
   // 5. Return validation status
   ```

4. **Admin Interface for Code Management**
   - List all active codes with usage stats
   - Generate new codes with batch creation
   - Deactivate/expire codes manually
   - View usage history and associated customers
   - Export usage reports

5. **Code Management GraphQL Mutations**
   ```graphql
   mutation CreateWholesalerCodes($input: WholesalerCodeInput!) {
     metafieldsSet(metafields: [{
       namespace: "wholesaler_system"
       key: "active_codes"  
       value: $input
       type: "json"
     }]) {
       metafields {
         id
         value
       }
       userErrors {
         field
         message
       }
     }
   }
   ```

### 2.3 Caching & Performance Layer  
**Day 5 - Full Day (6-8 hours)**

**Sub-tasks:**
1. **Redis Setup on Vercel**
   - Create Redis instance (Upstash recommended)
   - Configure connection in Vercel environment
   - Implement connection pooling
   - Add Redis health checks

2. **Cache Strategy Implementation**
   - Corporate ID results: 24-hour TTL
   - Wholesaler codes: 1-hour TTL
   - Failed validations: 5-minute TTL (prevent spam)
   - Company data prefill: 24-hour TTL

3. **Cache Management System**
   ```javascript
   // /api/utils/cache-manager.js
   class CacheManager {
     async get(key) { /* implementation */ }
     async set(key, value, ttl) { /* implementation */ }
     async invalidate(pattern) { /* implementation */ }
     async stats() { /* cache hit/miss rates */ }
   }
   ```

4. **Cache Invalidation Strategy**
   - Manual invalidation endpoint for admin
   - Automatic expiration based on TTL
   - Pattern-based bulk invalidation
   - Emergency cache flush capability

5. **Performance Monitoring**
   - Response time tracking
   - Cache hit/miss ratios
   - API call frequency monitoring
   - Error rate tracking

**USER ACTION REQUIRED - Day 5 End:**
- Performance testing with cold cache (< 2 seconds)
- Performance testing with warm cache (< 200ms)
- Verify cache hit rate > 80% after warmup
- Test cache invalidation functionality

### 2.4 Unified Validation Endpoint
**Day 6 - Full Day (6-8 hours)**

**Sub-tasks:**
1. **Combined Validation Endpoint**
   ```javascript
   // /api/validate/complete.js
   // Combines corporate ID + wholesaler code validation
   // Returns comprehensive validation result
   ```

2. **Business Type Determination Logic**
   - Map gBizINFO data to business categories
   - Implement business classification rules
   - Handle edge cases and unknown types
   - Provide fallback categorization

3. **Company Data Prefill Service**
   - Extract company information from gBizINFO
   - Format for form prefill
   - Handle Japanese character encoding
   - Validate data completeness

4. **Comprehensive Logging System**
   - Validation attempts with timestamps
   - Success/failure rates by endpoint
   - Response time percentiles
   - Error categorization and frequency
   - Geographic usage patterns

5. **Monitoring Dashboard Data Collection**
   - Real-time validation metrics
   - Daily/weekly summary statistics
   - Error trend analysis
   - Performance benchmarking data

---

## PHASE 3: REGISTRATION SYSTEM (Days 7-12)

### 3.1 Registration Form UI Development (App Proxy)
**Day 7-8 - Two Full Days (12-16 hours)**

**Sub-tasks:**
1. **Create App Proxy Structure in Vercel**
   ```
   /app_proxy
     /components
       RegistrationForm.jsx
       FormSection.jsx
       ValidationDisplay.jsx
     /utils
       formValidation.js
       shopifySignature.js
     /styles
       registration.css
     index.js
   ```

2. **Form Field Implementation (All text in Japanese)**
   ```javascript
   const FORM_FIELDS = {
     // Corporate validation
     corporateNumber: { label: "法人番号", required: true, type: "text" },
     wholesalerCode: { label: "卸売業者コード", required: true, type: "text" },
     
     // Personal information  
     lastName: { label: "姓", required: true, type: "text" },
     firstName: { label: "名", required: true, type: "text" },
     lastNameKana: { label: "姓（カタカナ）", required: true, type: "katakana" },
     firstNameKana: { label: "名（カタカナ）", required: true, type: "katakana" },
     email: { label: "メールアドレス", required: true, type: "email" },
     phone: { label: "電話番号", required: true, type: "tel" },
     
     // Address information
     postalCode: { label: "郵便番号", required: true, type: "postal" },
     prefecture: { label: "都道府県", required: true, type: "select" },
     city: { label: "市区町村", required: true, type: "text" },
     address1: { label: "住所1", required: true, type: "text" },
     address2: { label: "住所2", required: false, type: "text" },
     
     // Business information
     businessType: { label: "業種", required: true, type: "select" },
     jobFunction: { label: "職種", required: true, type: "select" },
     storeName: { label: "店舗名", required: false, type: "text" },
     website: { label: "ウェブサイト", required: false, type: "url" },
     
     // Preferences
     productsInterest: { label: "興味のある製品", required: false, type: "multiselect" },
     chocolateInterest: { label: "興味のあるチョコレート", required: false, type: "multiselect" },
     ingredientsInterest: { label: "興味のある追加材料", required: false, type: "multiselect" },
     newsletter: { label: "ニュースレター購読", required: false, type: "checkbox" }
   };
   ```

3. **Japanese Form Helpers Implementation**
   ```javascript
   // Postal code to address lookup using Japan Post API
   async function lookupAddress(postalCode) {
     // Implementation for automatic address filling
   }
   
   // Katakana input validation
   function validateKatakana(input) {
     const katakanaRegex = /^[ァ-ヶー\s]+$/;
     return katakanaRegex.test(input);
   }
   
   // Phone number formatting (Japanese format)
   function formatPhoneNumber(phone) {
     // Implementation for Japanese phone format
   }
   ```

4. **Dropdown Options Data (in Japanese)**
   ```javascript
   const BUSINESS_TYPES = [
     "パン屋", "ケーキ屋", "チョコレート専門店", "カフェ", 
     "レストラン", "ホテル", "製菓学校", "食品メーカー",
     // ... 33+ options total
   ];
   
   const JOB_FUNCTIONS = [
     "オーナー", "シェフパティシエ", "パティシエ", "ベーカー",
     "製品開発", "購買", "マーケティング", "営業",
     // ... 12+ options total  
   ];
   ```

5. **App Proxy HTML/React Form Layout**
   ```jsx
   function RegistrationForm() {
     return (
       <div className="registration-container">
         <header className="form-header">
           <h1>Valrhona Japan B2B登録</h1>
           <p>法人向け登録フォーム</p>
         </header>
         
         <form onSubmit={handleSubmit} className="registration-form">
           <section className="form-section">
             <h2>企業情報検証</h2>
             <input type="text" name="corporateNumber" placeholder="法人番号" required />
             <input type="text" name="wholesalerCode" placeholder="卸売業者コード" required />
           </section>
           
           <section className="form-section">
             <h2>個人情報</h2>
             {/* Personal information fields */}
           </section>
           
           <section className="form-section">
             <h2>住所情報</h2>
             {/* Address fields with postal lookup */}
           </section>
           
           <section className="form-section">
             <h2>業務情報</h2>
             {/* Business information */}
           </section>
           
           <section className="form-section">
             <h2>製品への興味</h2>
             {/* Multi-select preferences */}
           </section>
           
           <button type="submit" className="submit-btn">登録する</button>
         </form>
       </div>
     );
   }
   ```

6. **App Proxy Endpoint Implementation**
   ```javascript
   // /app_proxy/index.js
   import { verifyShopifySignature } from './utils/shopifySignature.js';
   import { RegistrationForm } from './components/RegistrationForm.jsx';
   
   export default async function handler(req, res) {
     // Verify Shopify signature for security
     if (!verifyShopifySignature(req.query, process.env.SHOPIFY_WEBHOOK_SECRET)) {
       return res.status(401).json({ error: 'Unauthorized' });
     }
     
     if (req.method === 'GET') {
       // Serve registration form
       const html = `
         <!DOCTYPE html>
         <html lang="ja">
           <head>
             <meta charset="UTF-8">
             <meta name="viewport" content="width=device-width, initial-scale=1.0">
             <title>Valrhona Japan B2B登録</title>
             <link rel="stylesheet" href="/styles/registration.css">
           </head>
           <body>
             <div id="registration-app"></div>
             <script src="/js/registration.bundle.js"></script>
           </body>
         </html>
       `;
       res.setHeader('Content-Type', 'text/html');
       res.send(html);
     }
     
     if (req.method === 'POST') {
       // Handle form submission
       const formData = req.body;
       // Process registration logic
       return await processRegistration(formData, req.query.shop);
     }
   }
   ```

7. **Shopify Signature Verification**
   ```javascript
   // /app_proxy/utils/shopifySignature.js
   import crypto from 'crypto';
   
   export function verifyShopifySignature(query, secret) {
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

### 3.2 Form Validation & UX
**Day 9 - Full Day (6-8 hours)**

**Sub-tasks:**
1. **Real-time Validation Implementation**
   ```javascript
   // Corporate number validation on blur
   async function validateCorporateNumber(number) {
     const response = await fetch('/api/validate/corporate-id', {
       method: 'POST',
       body: JSON.stringify({ corporateNumber: number })
     });
     return response.json();
   }
   
   // Email format validation
   function validateEmail(email) {
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     return emailRegex.test(email);
   }
   
   // Required field checking
   function validateRequired(value, fieldName) {
     if (!value || value.trim() === '') {
       return `${fieldName}は必須項目です`;
     }
     return null;
   }
   ```

2. **Loading States & Feedback**
   ```jsx
   // Loading spinner during validation
   <s-spinner size="small" />
   
   // Inline validation indicators
   <s-badge status="success">検証済み</s-badge>
   <s-badge status="critical">エラー</s-badge>
   
   // Progress indicator
   <s-progress-bar progress={completionPercentage} />
   ```

3. **Error Messaging System (Japanese)**
   ```javascript
   const ERROR_MESSAGES = {
     corporateNumber: {
       invalid: "法人番号の形式が正しくありません（13桁の数字）",
       notFound: "この法人番号は登録されていません",
       networkError: "検証中にエラーが発生しました。もう一度お試しください"
     },
     email: {
       invalid: "メールアドレスの形式が正しくありません",
       required: "メールアドレスは必須項目です"
     },
     katakana: {
       invalid: "カタカナで入力してください",
       required: "カタカナ表記は必須項目です"
     }
   };
   ```

4. **Success Confirmation System**
   - Form completion progress tracking
   - Field validation success indicators
   - Pre-submission review screen
   - Confirmation dialog before submit

**USER ACTION REQUIRED - Day 9 End:**
- Fill form with valid data - should complete successfully
- Submit without required fields - should show specific errors
- Enter invalid corporate number - should show validation error
- Test on mobile device - should be fully responsive
- Test Japanese input methods work correctly

### 3.3 Customer Creation Flow
**Day 10-11 - Two Full Days (12-16 hours)**

**Sub-tasks:**
1. **Customer Creation GraphQL Mutation**
   ```graphql
   mutation CustomerCreate($input: CustomerInput!) {
     customerCreate(input: $input) {
       customer {
         id
         email
         firstName
         lastName
         tags
         metafields(first: 20) {
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

2. **Metafield Structure Implementation**
   ```javascript
   // B2B Validation metafields (namespace: "b2b_validation")
   const validationMetafields = {
     corporate_number: formData.corporateNumber,
     business_type: formData.businessType,
     function: formData.jobFunction,
     validation_status: "approved", // or "pending", "rejected"
     validation_date: new Date().toISOString(),
     wholesaler_code: formData.wholesalerCode,
     store_name: formData.storeName,
     website: formData.website
   };
   
   // B2B Preferences metafields (namespace: "b2b_preferences")
   const preferencesMetafields = {
     products_interest: JSON.stringify(formData.productsInterest),
     chocolate_interest: JSON.stringify(formData.chocolateInterest),
     ingredients_interest: JSON.stringify(formData.ingredientsInterest),
     newsletter_consent: formData.newsletter
   };
   ```

3. **Customer Tags Implementation**
   ```javascript
   function generateCustomerTags(formData, validationResult) {
     const tags = [];
     
     // Primary access control tag
     if (validationResult.success) {
       tags.push("b2b_validated");
     } else {
       tags.push("pending_review");
     }
     
     // Business segmentation tags
     tags.push(`business_type:${formData.businessType}`);
     tags.push(`function:${formData.jobFunction}`);
     
     // Geographic tags
     tags.push(`prefecture:${formData.prefecture}`);
     
     return tags;
   }
   ```

4. **Multi-select Field Storage**
   ```javascript
   // Handle array fields for interests
   function processMultiSelectFields(formData) {
     return {
       ...formData,
       productsInterest: Array.isArray(formData.productsInterest) 
         ? formData.productsInterest 
         : [formData.productsInterest].filter(Boolean),
       chocolateInterest: Array.isArray(formData.chocolateInterest)
         ? formData.chocolateInterest
         : [formData.chocolateInterest].filter(Boolean),
       ingredientsInterest: Array.isArray(formData.ingredientsInterest)
         ? formData.ingredientsInterest
         : [formData.ingredientsInterest].filter(Boolean)
     };
   }
   ```

5. **Customer Creation Endpoint**
   ```javascript
   // /api/customers/create.js (in Shopify app)
   export default async function createCustomer(formData, validationResult) {
     try {
       const customerInput = {
         firstName: formData.firstName,
         lastName: formData.lastName,
         email: formData.email,
         phone: formData.phone,
         addresses: [{
           address1: formData.address1,
           address2: formData.address2,
           city: formData.city,
           province: formData.prefecture,
           zip: formData.postalCode,
           country: "Japan"
         }],
         tags: generateCustomerTags(formData, validationResult),
         metafields: [
           ...createValidationMetafields(formData, validationResult),
           ...createPreferencesMetafields(formData)
         ]
       };
       
       const response = await shopify.graphql(CUSTOMER_CREATE_MUTATION, {
         variables: { input: customerInput }
       });
       
       return response;
     } catch (error) {
       console.error('Customer creation failed:', error);
       throw error;
     }
   }
   ```

### 3.4 Auto-login Implementation
**Day 12 - Full Day (6-8 hours)**

**Sub-tasks:**
1. **Customer Account API Integration**
   ```javascript
   // Configure Customer Account API OAuth
   const customerAccountConfig = {
     clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
     clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
     redirectUri: process.env.SHOPIFY_APP_URL + '/auth/callback',
     scopes: ['openid', 'email', 'customer-account-api:full']
   };
   ```

2. **Seamless Login Flow After Registration**
   ```javascript
   async function handlePostRegistrationLogin(customer) {
     try {
       // Generate customer account access token
       const authUrl = generateCustomerAccountAuthUrl(customer.email);
       
       // Redirect to customer account authentication
       return {
         success: true,
         redirectUrl: authUrl,
         message: "登録が完了しました。ログインしています..."
       };
     } catch (error) {
       // Fallback to manual login
       return {
         success: false,
         fallbackUrl: "/account/login",
         message: "登録は完了しましたが、手動でログインしてください。"
       };
     }
   }
   ```

3. **Token Management System**
   ```javascript
   class CustomerTokenManager {
     async createAccessToken(customerId) {
       // Implementation for customer access token creation
     }
     
     async refreshToken(refreshToken) {
       // Implementation for token refresh
     }
     
     async validateToken(accessToken) {
       // Implementation for token validation
     }
   }
   ```

4. **Edge Case Handling**
   ```javascript
   // Handle existing email address
   async function handleExistingEmail(email) {
     const existingCustomer = await findCustomerByEmail(email);
     if (existingCustomer) {
       if (existingCustomer.tags.includes('b2b_validated')) {
         return { 
           error: "このメールアドレスは既に登録されています",
           action: "login"
         };
       } else {
         return {
           error: "このメールアドレスでの登録は審査中です",
           action: "contact_support"
         };
       }
     }
     return { success: true };
   }
   
   // Handle failed auto-login
   function handleLoginFailure(customer) {
     return {
       message: "登録は成功しましたが、自動ログインに失敗しました。",
       loginUrl: `/account/login?email=${encodeURIComponent(customer.email)}`,
       supportUrl: "/contact"
     };
   }
   
   // Handle session timeout
   function handleSessionTimeout() {
     return {
       message: "セッションが期限切れです。再度ログインしてください。",
       loginUrl: "/account/login"
     };
   }
   ```

5. **Welcome Flow After Login**
   ```javascript
   function createWelcomeFlow(customer) {
     return {
       welcomeMessage: `${customer.firstName}様、Valrhona B2Bポータルへようこそ！`,
       nextSteps: [
         "プロフィール情報の確認",
         "サンプル注文の開始", 
         "製品カタログの閲覧"
       ],
       redirectUrl: "/dashboard"
     };
   }
   ```

---

## PHASE 4: ACCESS CONTROL SYSTEM (Days 13-16)

### 4.1 Locksmith Installation & Configuration
**Day 13 - Full Day (6-8 hours)**

**Sub-tasks:**
1. **Locksmith App Installation**
   
   **USER ACTION REQUIRED:**
   - Install Locksmith app from Shopify App Store
   - Complete setup wizard
   - Note down API credentials for integration
   - Configure basic settings for Japanese store

2. **Create Store-Wide Lock**
   ```javascript
   // Locksmith configuration via API
   const storeLockConfig = {
     name: "B2B認証済みお客様専用",
     description: "法人番号認証済みのお客様のみアクセス可能",
     lockType: "store_wide",
     isActive: true,
     defaultAction: "redirect_to_registration"
   };
   ```

3. **Define Access Key Conditions**
   ```javascript
   const accessConditions = {
     // Primary condition: Customer has b2b_validated tag
     condition1: {
       type: "customer_tag",
       operator: "contains",
       value: "b2b_validated"
     },
     
     // Secondary condition: Validation status approved
     condition2: {
       type: "customer_metafield",
       namespace: "b2b_validation",
       key: "validation_status",
       operator: "equals",
       value: "approved"
     },
     
     // Combine conditions with AND logic
     logic: "condition1 AND condition2"
   };
   ```

4. **Configure Locksmith via API**
   ```javascript
   async function configureLocksmith() {
     const locksmithConfig = {
       locks: [{
         name: "B2B Store Access",
         resources: ["*"], // Lock entire store
         conditions: accessConditions,
         messages: {
           denied_ja: "このサイトは法人のお客様専用です。",
           registration_cta_ja: "法人登録はこちら"
         }
       }],
       exceptions: [
         "/pages/b2b-registration",
         "/pages/company-info", 
         "/pages/contact",
         "/account/login",
         "/account/register"
       ]
     };
     
     return await locksmithAPI.updateConfiguration(locksmithConfig);
   }
   ```

### 4.2 Admin Dashboard Development
**Day 14 - Full Day (6-8 hours)**

**Sub-tasks:**
1. **Create B2B Registration Management Dashboard**
   ```jsx
   // /app/routes/app.registrations.jsx
   function RegistrationsDashboard() {
     return (
       <Page title="B2B Registration Management">
         <ui-title-bar title="B2B顧客登録管理">
           <button variant="primary" onClick={() => navigate('/app/wholesaler-codes')}>
             卸売業者コード管理
           </button>
         </ui-title-bar>
         <Layout>
           <Layout.Section>
             <Card>
               <DataTable 
                 columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                 headings={['顧客名', '法人番号', '業種', 'ステータス', 'アクション']}
                 rows={registrationData}
               />
             </Card>
           </Layout.Section>
         </Layout>
       </Page>
     );
   }
   ```

2. **Customer Listing with Metafields Query**
   ```graphql
   query GetB2BCustomers($first: Int!, $query: String) {
     customers(first: $first, query: $query) {
       edges {
         node {
           id
           firstName
           lastName
           email
           phone
           tags
           metafields(namespace: "b2b_validation", first: 10) {
             edges {
               node {
                 key
                 value
               }
             }
           }
         }
       }
     }
   }
   ```

3. **Configure Locksmith Exceptions for App Proxy**
   ```javascript
   const locksmithExceptions = {
     allowedPaths: [
       "/apps/b2b-registration",     // App proxy URL
       "/apps/b2b-registration/*",  // App proxy subpaths
       "/pages/company-info",
       "/pages/terms-of-service", 
       "/pages/privacy-policy",
       "/pages/contact"
     ],
     allowedResources: [
       "valrhona-logo.png",
       "company-background.jpg"
     ],
     cartMaintenance: true // Maintain cart contents during registration
   };
   ```

4. **Registration Approval/Rejection Actions**
   ```javascript
   // Admin action to approve B2B registration
   async function approveRegistration(customerId) {
     const updateInput = {
       id: customerId,
       tags: ["b2b_validated", "b2b_approved"],
       metafields: [{
         namespace: "b2b_validation",
         key: "validation_status", 
         value: "approved",
         type: "single_line_text_field"
       }]
     };
     
     return await admin.graphql(CUSTOMER_UPDATE_MUTATION, {
       variables: { input: updateInput }
     });
   }
   ```

4. **Style Registration Page for Valrhona Brand**
   ```css
   .registration-container {
     max-width: 800px;
     margin: 0 auto;
     padding: 2rem;
     font-family: 'Noto Sans JP', sans-serif;
   }
   
   .company-header {
     text-align: center;
     margin-bottom: 3rem;
     border-bottom: 2px solid #8B4513; /* Valrhona brown */
   }
   
   .registration-form {
     background: #ffffff;
     border-radius: 8px;
     box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
     padding: 2rem;
   }
   
   /* Japanese typography optimization */
   h1, h2, h3 {
     font-weight: 600;
     line-height: 1.4;
     color: #2c1810;
   }
   
   .form-field {
     margin-bottom: 1.5rem;
   }
   
   .required-field label::after {
     content: " *";
     color: #d72c0d;
   }
   ```

### 4.3 Access Denied Experience
**Day 15 - Full Day (6-8 hours)**

**Sub-tasks:**
1. **Customize Locksmith Denial Messages**
   ```javascript
   const denialMessages = {
     japanese: {
       title: "法人お客様専用サイト",
       message: "申し訳ございませんが、このサイトは認証済み法人お客様専用となっております。",
       ctaButton: "法人登録を行う",
       supportText: "既に登録済みの方は、メールアドレスとパスワードでログインしてください。",
       loginButton: "ログイン",
       helpText: "ご不明な点がございましたら、カスタマーサポートまでお問い合わせください。",
       contactButton: "お問い合わせ"
     }
   };
   ```

2. **Create Custom Denial Page Template**
   ```liquid
   <!-- /templates/locksmith-denial.liquid -->
   <div class="access-denied-container">
     <div class="valrhona-branding">
       <img src="{{ 'valrhona-logo-large.png' | asset_url }}" alt="Valrhona Japan">
     </div>
     
     <div class="denial-content">
       <h1>{{ denial_messages.japanese.title }}</h1>
       <p class="denial-message">{{ denial_messages.japanese.message }}</p>
       
       <div class="action-buttons">
         <a href="/pages/b2b-registration" class="btn btn-primary">
           {{ denial_messages.japanese.ctaButton }}
         </a>
         <a href="/account/login" class="btn btn-secondary">
           {{ denial_messages.japanese.loginButton }}
         </a>
       </div>
       
       <div class="support-section">
         <p>{{ denial_messages.japanese.helpText }}</p>
         <a href="/pages/contact" class="support-link">
           {{ denial_messages.japanese.contactButton }}
         </a>
         <p class="phone-support">お電話: 03-1234-5678 (平日 9:00-17:00)</p>
       </div>
     </div>
   </div>
   ```

3. **Create Help Documentation Pages**
   ```markdown
   <!-- /pages/registration-guide.md -->
   # 法人お客様登録ガイド
   
   ## 登録に必要な情報
   1. 法人番号（13桁）
   2. 卸売業者認証コード
   3. 代表者情報
   4. 会社住所
   5. 連絡先情報
   
   ## 登録手順
   1. 法人番号の入力と検証
   2. 卸売業者コードの入力
   3. 会社情報の自動入力確認
   4. 代表者情報の入力
   5. 製品への興味の選択
   6. 登録完了とアカウント作成
   
   ## よくある質問
   ### Q: 法人番号がわからない場合
   A: 国税庁の法人番号公表サイトで検索できます
   
   ### Q: 卸売業者コードの取得方法
   A: 弊社営業担当または代理店にお問い合わせください
   ```

4. **Deep Link Redirect Maintenance**
   ```javascript
   // Maintain intended destination during registration flow
   function handleDeepLinkRedirect(originalUrl, customerData) {
     // Store intended destination in session
     sessionStorage.setItem('postLoginRedirect', originalUrl);
     
     // After successful registration/login
     const redirectUrl = sessionStorage.getItem('postLoginRedirect') || '/';
     sessionStorage.removeItem('postLoginRedirect');
     
     return redirectUrl;
   }
   ```

### 4.4 Integration Testing
**Day 16 - Full Day (6-8 hours)**

**Sub-tasks:**
1. **Comprehensive Flow Testing Scenarios**

   **Scenario 1: New Valid Customer Registration**
   ```javascript
   const testScenario1 = {
     description: "新規有効顧客登録フロー",
     steps: [
       "未認証状態でサイト訪問 → 登録ページにリダイレクト",
       "有効な法人番号入力 → 会社情報自動入力",
       "有効な卸売業者コード入力 → 検証成功",
       "全項目入力完了 → バリデーション通過",
       "登録送信 → 顧客作成成功",
       "自動ログイン → ダッシュボードアクセス可能"
     ],
     expectedResult: "完全なアクセス権限付与"
   };
   ```

   **Scenario 2: Invalid Corporate Number Handling**
   ```javascript
   const testScenario2 = {
     description: "無効法人番号処理フロー",
     steps: [
       "無効な法人番号入力 → エラーメッセージ表示",
       "修正後再入力 → 検証再実行",
       "それでも無効 → 手動審査フラグ設定",
       "顧客作成（pending_reviewタグ付き）",
       "アクセス試行 → 審査中メッセージ表示"
     ],
     expectedResult: "手動審査待ち状態"
   };
   ```

   **Scenario 3: Existing Customer Registration Attempt**
   ```javascript
   const testScenario3 = {
     description: "既存顧客重複登録試行",
     steps: [
       "既存メールアドレスで登録試行",
       "重複検知 → 適切なエラーメッセージ",
       "ログインページへの誘導",
       "正常ログイン → アクセス権限確認"
     ],
     expectedResult: "重複防止とログイン誘導"
   };
   ```

2. **Performance Testing Requirements**
   
   **USER ACTION REQUIRED - Throughout Day 16:**
   - Registration completion time: < 10 seconds
   - Run 10 concurrent registrations without data loss
   - Validation endpoint response: < 500ms (warm cache)
   - Page load time after login: < 2 seconds
   - Mobile device testing on iOS and Android

3. **Error Logging and Monitoring Setup**
   ```javascript
   // Comprehensive error tracking
   const errorTracker = {
     registrationErrors: [],
     validationErrors: [],
     authenticationErrors: [],
     performanceMetrics: {}
   };
   
   function logRegistrationError(error, context) {
     errorTracker.registrationErrors.push({
       timestamp: new Date().toISOString(),
       error: error.message,
       stack: error.stack,
       context: {
         userAgent: context.userAgent,
         formData: context.formData, // sanitized
         step: context.currentStep
       }
     });
   }
   ```

4. **End-to-End Testing Checklist**
   - [ ] Unregistered user cannot access store
   - [ ] Registration page accessible to all
   - [ ] Form validation works in real-time
   - [ ] Corporate number validation functional
   - [ ] Wholesaler code validation functional
   - [ ] Customer creation successful
   - [ ] Metafields properly stored
   - [ ] Tags correctly applied
   - [ ] Auto-login functional
   - [ ] Access granted after registration
   - [ ] Locksmith properly configured
   - [ ] Deep links maintain redirect
   - [ ] Mobile experience optimized
   - [ ] Error messages in Japanese
   - [ ] Performance meets requirements

---

## PHASE 5: ADMIN INTERFACE & MANAGEMENT (Days 17-19)

### 5.1 Manual Review Queue
**Day 17 - Full Day (6-8 hours)**

**Sub-tasks:**
1. **Admin Interface for Pending Reviews**
   ```jsx
   // Admin dashboard component
   function PendingReviewsDashboard() {
     return (
       <s-page title="B2B登録審査待ち">
         <s-section>
           <s-heading>審査待ち顧客一覧</s-heading>
           <PendingCustomersTable />
         </s-section>
         
         <s-section>
           <s-heading>審査統計</s-heading>
           <ReviewStatistics />
         </s-section>
       </s-page>
     );
   }
   ```

2. **Pending Customers Table Implementation**
   ```javascript
   function PendingCustomersTable() {
     const columns = [
       { header: "申請日", key: "submissionDate" },
       { header: "会社名", key: "companyName" },
       { header: "法人番号", key: "corporateNumber" },
       { header: "代表者", key: "contactPerson" },
       { header: "失敗理由", key: "failureReason" },
       { header: "アクション", key: "actions" }
     ];
     
     return (
       <s-table>
         {pendingCustomers.map(customer => (
           <tr key={customer.id}>
             <td>{formatDate(customer.createdAt)}</td>
             <td>{customer.companyName}</td>
             <td>{customer.corporateNumber}</td>
             <td>{customer.firstName} {customer.lastName}</td>
             <td>{customer.validationFailureReason}</td>
             <td>
               <s-button onclick={() => approveCustomer(customer.id)}>
                 承認
               </s-button>
               <s-button variant="secondary" onclick={() => rejectCustomer(customer.id)}>
                 拒否
               </s-button>
             </td>
           </tr>
         ))}
       </s-table>
     );
   }
   ```

3. **Manual Approval/Rejection Functions**
   ```javascript
   async function approveCustomer(customerId) {
     try {
       // Update customer metafield
       await shopify.graphql(`
         mutation UpdateCustomerValidation($id: ID!, $metafields: [MetafieldInput!]!) {
           customerUpdate(input: {
             id: $id
             metafields: $metafields
           }) {
             customer {
               id
               tags
             }
             userErrors {
               field
               message
             }
           }
         }
       `, {
         variables: {
           id: customerId,
           metafields: [{
             namespace: "b2b_validation",
             key: "validation_status",
             value: "approved",
             type: "single_line_text_field"
           }]
         }
       });
       
       // Add b2b_validated tag and remove pending_review
       await updateCustomerTags(customerId, {
         add: ["b2b_validated"],
         remove: ["pending_review"]
       });
       
       // Send approval email
       await sendApprovalEmail(customerId);
       
       // Log approval action
       await logAdminAction("customer_approved", { customerId, adminId: getCurrentAdmin().id });
       
     } catch (error) {
       console.error("Customer approval failed:", error);
       throw error;
     }
   }
   
   async function rejectCustomer(customerId, reason) {
     try {
       // Update validation status
       await updateCustomerMetafield(customerId, "b2b_validation", "validation_status", "rejected");
       await updateCustomerMetafield(customerId, "b2b_validation", "rejection_reason", reason);
       
       // Update tags
       await updateCustomerTags(customerId, {
         add: ["b2b_rejected"],
         remove: ["pending_review"]
       });
       
       // Send rejection email with reason
       await sendRejectionEmail(customerId, reason);
       
       // Log rejection action
       await logAdminAction("customer_rejected", { customerId, reason, adminId: getCurrentAdmin().id });
       
     } catch (error) {
       console.error("Customer rejection failed:", error);
       throw error;
     }
   }
   ```

4. **Email Notification System**
   ```javascript
   async function sendApprovalEmail(customerId) {
     const customer = await getCustomerById(customerId);
     const emailTemplate = {
       to: customer.email,
       subject: "Valrhona B2Bアカウント承認のお知らせ",
       html: `
         <h2>アカウント承認のお知らせ</h2>
         <p>${customer.firstName}様</p>
         <p>この度は、Valrhona Japan B2Bポータルへのご登録をいただき、誠にありがとうございます。</p>
         <p>お客様のアカウントが承認されました。下記のリンクからログインいただけます。</p>
         <a href="${process.env.SHOPIFY_APP_URL}/account/login" class="btn">ログイン</a>
         <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
       `
     };
     
     return await emailService.send(emailTemplate);
   }
   
   async function sendRejectionEmail(customerId, reason) {
     const customer = await getCustomerById(customerId);
     const emailTemplate = {
       to: customer.email,
       subject: "Valrhona B2B登録に関するお知らせ",
       html: `
         <h2>登録審査結果のお知らせ</h2>
         <p>${customer.firstName}様</p>
         <p>この度は、Valrhona Japan B2Bポータルへのご登録をいただき、誠にありがとうございます。</p>
         <p>申し訳ございませんが、今回のご登録につきまして、下記の理由により承認いたしかねます：</p>
         <p><strong>${reason}</strong></p>
         <p>ご不明な点やご質問がございましたら、お気軽にお問い合わせください。</p>
         <p>お問い合わせ: support@valrhona-japan.com</p>
       `
     };
     
     return await emailService.send(emailTemplate);
   }
   ```

### 5.2 Analytics & Monitoring Dashboard
**Day 18 - Full Day (6-8 hours)**

**Sub-tasks:**
1. **Registration Analytics Implementation**
   ```javascript
   // Analytics data collection
   class RegistrationAnalytics {
     async getRegistrationMetrics(timeRange) {
       return {
         totalAttempts: await this.getTotalAttempts(timeRange),
         successfulRegistrations: await this.getSuccessfulRegistrations(timeRange),
         failedValidations: await this.getFailedValidations(timeRange),
         conversionRate: await this.getConversionRate(timeRange),
         averageCompletionTime: await this.getAverageCompletionTime(timeRange),
         dropOffPoints: await this.getDropOffAnalysis(timeRange)
       };
     }
     
     async getBusinessTypeBreakdown() {
       const customers = await this.getValidatedCustomers();
       return customers.reduce((acc, customer) => {
         const businessType = customer.metafield('b2b_validation', 'business_type');
         acc[businessType] = (acc[businessType] || 0) + 1;
         return acc;
       }, {});
     }
     
     async getGeographicDistribution() {
       const customers = await this.getValidatedCustomers();
       return customers.reduce((acc, customer) => {
         const prefecture = customer.addresses[0]?.province || 'Unknown';
         acc[prefecture] = (acc[prefecture] || 0) + 1;
         return acc;
       }, {});
     }
   }
   ```

2. **Admin Analytics Dashboard**
   ```jsx
   function AnalyticsDashboard() {
     const [metrics, setMetrics] = useState(null);
     const [timeRange, setTimeRange] = useState('30d');
     
     return (
       <s-page title="B2B登録分析">
         <s-section>
           <s-heading>登録統計</s-heading>
           <div class="metrics-grid">
             <MetricCard 
               title="総登録試行数" 
               value={metrics.totalAttempts}
               trend={metrics.attemptsTrend}
             />
             <MetricCard 
               title="成功登録数" 
               value={metrics.successfulRegistrations}
               trend={metrics.successTrend}
             />
             <MetricCard 
               title="転換率" 
               value={`${metrics.conversionRate}%`}
               trend={metrics.conversionTrend}
             />
             <MetricCard 
               title="平均完了時間" 
               value={`${metrics.averageCompletionTime}秒`}
               trend={metrics.timeTrend}
             />
           </div>
         </s-section>
         
         <s-section>
           <s-heading>業種別分析</s-heading>
           <BusinessTypeChart data={metrics.businessTypeBreakdown} />
         </s-section>
         
         <s-section>
           <s-heading>地域別分析</s-heading>
           <GeographicChart data={metrics.geographicDistribution} />
         </s-section>
         
         <s-section>
           <s-heading>離脱ポイント分析</s-heading>
           <DropOffAnalysis data={metrics.dropOffPoints} />
         </s-section>
       </s-page>
     );
   }
   ```

3. **Real-time Monitoring Setup**
   ```javascript
   // Set up monitoring alerts
   const monitoringConfig = {
     alerts: [
       {
         name: "High Registration Failure Rate",
         condition: "registration_failure_rate > 50% over 1 hour",
         action: "email_admin",
         recipients: ["admin@valrhona-japan.com"]
       },
       {
         name: "API Endpoint Down",
         condition: "validation_api_uptime < 95% over 15 minutes",
         action: "email_admin_urgent",
         recipients: ["dev-team@valrhona-japan.com", "admin@valrhona-japan.com"]
       },
       {
         name: "Unusual Activity Pattern",
         condition: "registration_attempts > 100 per hour from single IP",
         action: "rate_limit_ip",
         autoAction: true
       }
     ]
   };
   ```

4. **Performance Metrics Dashboard**
   ```javascript
   function PerformanceMetrics() {
     return (
       <s-section>
         <s-heading>システムパフォーマンス</s-heading>
         <div class="performance-grid">
           <PerformanceCard 
             title="検証API応答時間"
             value={`${avgResponseTime}ms`}
             threshold={500}
             status={getStatus(avgResponseTime, 500)}
           />
           <PerformanceCard 
             title="キャッシュヒット率"
             value={`${cacheHitRate}%`}
             threshold={80}
             status={getStatus(cacheHitRate, 80)}
           />
           <PerformanceCard 
             title="システム稼働率"
             value={`${uptime}%`}
             threshold={99.9}
             status={getStatus(uptime, 99.9)}
           />
         </div>
       </s-section>
     );
   }
   ```

### 5.3 Documentation & Training
**Day 19 - Full Day (6-8 hours)**

**Sub-tasks:**
1. **User Documentation (Japanese)**
   ```markdown
   # Valrhona Japan B2Bポータル ユーザーガイド
   
   ## はじめに
   このガイドでは、Valrhona Japan B2Bポータルの法人登録から製品注文まで
   の全プロセスをご説明します。
   
   ## 法人登録手順
   
   ### 1. 法人情報の準備
   登録前に以下の情報をご準備ください：
   - 法人番号（13桁）
   - 卸売業者認証コード
   - 代表者情報
   - 会社住所・連絡先
   
   ### 2. 登録フォームの入力
   1. https://valrhona-japan.myshopify.com/pages/b2b-registration にアクセス
   2. 法人番号を入力し、「検証」ボタンをクリック
   3. 会社情報が自動入力されることを確認
   4. 卸売業者コードを入力
   5. 代表者情報を入力
   6. 住所情報を確認・修正
   7. 業種・職種を選択
   8. 製品への興味を選択（任意）
   9. 「登録」ボタンをクリック
   
   ### 3. アカウント承認
   - 通常、1-2営業日以内に承認されます
   - 承認後、メールで通知されます
   - 承認後、すぐにサイトにアクセス可能になります
   
   ## よくある質問
   
   ### Q: 法人番号がわからない場合はどうすればよいですか？
   A: 国税庁の法人番号公表サイト（https://www.houjin-bangou.nta.go.jp/）
      で会社名から検索できます。
   
   ### Q: 卸売業者コードの取得方法を教えてください
   A: 弊社営業担当者または正規代理店にお問い合わせください。
   
   ### Q: 登録が承認されない場合は？
   A: 以下の理由が考えられます：
      - 法人番号が無効または存在しない
      - 卸売業者コードが間違っている
      - 必要書類が不足している
      詳細はカスタマーサポートまでお問い合わせください。
   ```

2. **Technical Documentation (English)**
   ```markdown
   # Valrhona B2B Portal - Technical Documentation
   
   ## Architecture Overview
   
   ### System Components
   - **Shopify App**: Remix-based application handling UI and customer management
   - **Vercel Functions**: CORS proxy for gBizINFO API integration
   - **Locksmith App**: Third-party access control system
   - **Redis Cache**: Performance optimization for validation requests
   
   ### Data Flow
   1. User submits registration form
   2. Frontend validates input and calls Vercel API
   3. Vercel function queries gBizINFO API
   4. Response cached in Redis
   5. Customer created in Shopify with metafields and tags
   6. Locksmith evaluates access permissions
   7. User granted/denied access based on validation status
   
   ## API Endpoints
   
   ### Validation Endpoints
   - `POST /api/validate/corporate-id` - Validate Japanese corporate number
   - `POST /api/validate/wholesaler-code` - Validate wholesaler access code
   - `POST /api/validate/complete` - Combined validation endpoint
   - `GET /api/validate/health` - Health check endpoint
   
   ### Customer Management
   - `POST /api/customers/create` - Create validated customer
   - `PUT /api/customers/approve` - Manual customer approval
   - `PUT /api/customers/reject` - Manual customer rejection
   
   ## Database Schema
   
   ### Customer Metafields
   ```json
   {
     "b2b_validation": {
       "corporate_number": "1234567890123",
       "business_type": "パン屋",
       "function": "オーナー",
       "validation_status": "approved",
       "validation_date": "2024-01-15T10:30:00Z",
       "wholesaler_code": "VALR-2024-0001"
     },
     "b2b_preferences": {
       "products_interest": ["チョコレート", "ココア"],
       "chocolate_interest": ["ダークチョコレート", "ミルクチョコレート"],
       "ingredients_interest": ["ナッツ", "フルーツ"]
     }
   }
   ```
   
   ### Customer Tags
   - `b2b_validated`: Primary access control tag
   - `business_type:{type}`: Business category segmentation
   - `function:{function}`: Job function segmentation
   - `pending_review`: Manual review required
   - `b2b_rejected`: Registration rejected
   
   ## Deployment Process
   
   ### Environment Variables
   ```bash
   # Shopify Configuration
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   SHOPIFY_APP_URL=https://your-app.vercel.app
   
   # gBizINFO API
   GBIZ_API_TOKEN=your_token_here
   GBIZ_API_BASE_URL=https://info.gbiz.go.jp/api/v1
   
   # Redis Cache
   REDIS_URL=redis://...
   
   # Security
   WEBHOOK_SECRET=your_webhook_secret
   JWT_SECRET=your_jwt_secret
   ```
   
   ### Deployment Steps
   1. Deploy Vercel functions with environment variables
   2. Deploy Shopify app to production
   3. Configure Locksmith in production store
   4. Test end-to-end flow
   5. Monitor for first 48 hours
   
   ## Maintenance Procedures
   
   ### Daily Tasks
   - Check pending registration queue
   - Monitor error logs
   - Verify API response times
   - Review cache performance
   
   ### Weekly Tasks
   - Analyze registration conversion rates
   - Update wholesaler codes if needed
   - Review and respond to customer feedback
   - Update documentation as needed
   
   ### Monthly Tasks
   - Performance optimization review
   - Security audit
   - Backup verification
   - Capacity planning review
   ```

3. **Admin Training Materials**
   
   **VIDEO SCRIPT 1: Managing Wholesaler Codes**
   ```
   Title: 卸売業者コード管理ガイド
   Duration: 5-7 minutes
   
   Script:
   "こんにちは。今日はValrhona B2Bポータルの卸売業者コード管理について
   説明します。
   
   [Screen: Admin dashboard]
   まず、管理画面にログインし、「卸売業者コード管理」を選択します。
   
   [Screen: Code list]
   現在アクティブなコードの一覧が表示されます。各コードの使用状況、
   有効期限、関連付けられた顧客数を確認できます。
   
   [Screen: Add new code]
   新しいコードを追加するには、「新規作成」ボタンをクリックします。
   コード形式は自動生成されますが、有効期限と使用回数制限を設定できます。
   
   [Screen: Batch creation]
   複数のコードを一括作成する場合は、「一括作成」機能を使用します。
   
   [Screen: Code deactivation]
   コードを無効化する場合は、対象コードの「無効化」ボタンをクリックします。
   既に使用されているコードでも安全に無効化できます。"
   ```

4. **Troubleshooting Guide**
   ```markdown
   # トラブルシューティングガイド
   
   ## 一般的な問題と解決方法
   
   ### 登録エラー
   
   #### 問題: 法人番号が認識されない
   **症状**: 「法人番号が見つかりません」エラー
   **原因**: 
   - 入力ミス（ハイフンの有無、桁数など）
   - gBizINFO APIの一時的な問題
   - キャッシュの問題
   
   **解決方法**:
   1. 法人番号を再確認（13桁、ハイフンなし）
   2. 国税庁法人番号公表サイトで確認
   3. 数分後に再試行
   4. 問題が続く場合は管理者に連絡
   
   #### 問題: 卸売業者コードが無効
   **症状**: 「コードが無効です」エラー
   **原因**:
   - コードの入力ミス
   - コードの有効期限切れ
   - 使用回数制限到達
   
   **解決方法**:
   1. コードを正確に再入力
   2. 管理画面でコード状態を確認
   3. 必要に応じて新しいコードを発行
   
   ### システムエラー
   
   #### 問題: ページが表示されない
   **症状**: 500エラーまたは白いページ
   **原因**:
   - サーバーの一時的な問題
   - データベース接続の問題
   - Locksmithの設定問題
   
   **解決方法**:
   1. ブラウザを更新
   2. 別のブラウザで試行
   3. システム状態を確認
   4. 問題が続く場合は緊急連絡先に連絡
   
   ## 緊急連絡先
   - 技術サポート: tech-support@valrhona-japan.com
   - 営業サポート: sales-support@valrhona-japan.com
   - 緊急電話: 03-1234-5678 (24時間対応)
   ```

---

## PHASE 6: DEPLOYMENT & GO-LIVE (Days 20-21)

### 6.1 Security Audit & Deployment Preparation
**Day 20 - Full Day (6-8 hours)**

**Sub-tasks:**
1. **Security Audit Checklist**
   ```javascript
   const securityAudit = {
     authentication: [
       "✓ API tokens stored securely in environment variables",
       "✓ No secrets committed to repository", 
       "✓ Webhook signatures properly validated",
       "✓ Customer Account API properly configured",
       "✓ Session management secure"
     ],
     dataProtection: [
       "✓ Customer data encrypted in transit",
       "✓ Metafield data properly sanitized",
       "✓ PII handling compliant with Japanese privacy laws",
       "✓ GDPR compliance for EU customers",
       "✓ Data retention policies implemented"
     ],
     accessControl: [
       "✓ Locksmith properly configured",
       "✓ Admin permissions correctly set",
       "✓ API access properly scoped",
       "✓ Customer access based on validation status",
       "✓ No unauthorized access paths"
     ],
     apiSecurity: [
       "✓ Rate limiting implemented",
       "✓ Input validation on all endpoints",
       "✓ CORS properly configured",
       "✓ API versioning implemented",
       "✓ Error messages don't leak sensitive data"
     ]
   };
   ```

2. **Environment Variables Verification**
   ```bash
   # Production environment variables checklist
   SHOPIFY_API_KEY=✓ Set and valid
   SHOPIFY_API_SECRET=✓ Set and valid
   SHOPIFY_APP_URL=✓ Points to production domain
   GBIZ_API_TOKEN=✓ Valid and tested
   REDIS_URL=✓ Production Redis instance
   WEBHOOK_SECRET=✓ Matches Shopify webhook config
   JWT_SECRET=✓ Strong, unique secret
   NODE_ENV=production
   ```

3. **Deployment Checklist Creation**
   ```markdown
   # Production Deployment Checklist
   
   ## Pre-deployment
   - [ ] All tests passing
   - [ ] Security audit completed
   - [ ] Environment variables configured
   - [ ] Backup procedures tested
   - [ ] Rollback plan prepared
   - [ ] Team notified of deployment
   
   ## Deployment Steps
   - [ ] Deploy Vercel functions
   - [ ] Deploy Shopify app
   - [ ] Configure production Locksmith
   - [ ] Update DNS if needed
   - [ ] Verify SSL certificates
   - [ ] Test critical paths
   
   ## Post-deployment
   - [ ] Monitor error rates
   - [ ] Verify performance metrics
   - [ ] Test registration flow
   - [ ] Check email notifications
   - [ ] Validate analytics collection
   ```

4. **Backup and Recovery Procedures**
   ```javascript
   // Backup strategy implementation
   const backupConfig = {
     daily: {
       customerData: "Full customer export via Shopify API",
       metafields: "Metafield backup to secure storage", 
       wholesalerCodes: "Code configuration backup",
       analytics: "Usage metrics backup"
     },
     weekly: {
       codebase: "Git repository backup",
       configuration: "All environment variables backup",
       documentation: "Updated documentation archive"
     },
     recovery: {
       rto: "2 hours", // Recovery Time Objective
       rpo: "4 hours", // Recovery Point Objective
       procedures: "Documented step-by-step recovery process"
     }
   };
   ```

### 6.2 Final Testing & Go-Live
**Day 21 - Full Day (6-8 hours)**

**Sub-tasks:**
1. **Production Environment Testing**
   
   **USER ACTION REQUIRED - Morning (3-4 hours):**
   - Complete full registration on production staging
   - Test with valid corporate number: `1010001000001`
   - Test with valid wholesaler code from production list
   - Verify all emails sent correctly (approval, rejection, welcome)
   - Test on multiple devices: iPhone, Android, Desktop Chrome, Desktop Safari
   - Verify Japanese language display correctly across all devices
   - Confirm analytics tracking working in production
   - Test admin functions: approval, rejection, code management

2. **Performance Validation**
   ```javascript
   // Production performance requirements
   const performanceTargets = {
     registrationFormLoad: "<2 seconds",
     corporateNumberValidation: "<500ms",
     formSubmission: "<3 seconds", 
     autoLoginRedirect: "<2 seconds",
     dashboardLoad: "<2 seconds",
     adminDashboardLoad: "<3 seconds"
   };
   
   // Monitoring setup for production
   const monitoringSetup = {
     errorTracking: "Sentry or equivalent",
     performanceMonitoring: "New Relic or equivalent", 
     uptimeMonitoring: "Pingdom or equivalent",
     logAggregation: "LogDNA or equivalent"
   };
   ```

3. **Go-Live Communication Plan**
   ```markdown
   # Go-Live Communication Plan
   
   ## Internal Team Notification
   **Recipients**: Development team, Valrhona Japan staff, customer service
   **Timeline**: 2 hours before go-live
   **Content**: 
   - Go-live schedule
   - What to expect
   - Emergency contacts
   - Initial monitoring period
   
   ## Customer Communication
   **Recipients**: Existing B2B customers, potential customers
   **Timeline**: Day of go-live
   **Content**:
   - New portal announcement
   - Registration instructions
   - Benefits of using the portal
   - Support contact information
   
   ## Stakeholder Update
   **Recipients**: Management, partners
   **Timeline**: Post go-live (within 24 hours)
   **Content**:
   - Successful launch confirmation
   - Initial metrics
   - Next steps
   ```

4. **Rollback Plan Preparation**
   ```javascript
   // Rollback procedures
   const rollbackPlan = {
     triggers: [
       "Registration success rate < 50%",
       "Critical security vulnerability discovered",
       "System downtime > 30 minutes",
       "Data integrity issues detected"
     ],
     
     steps: [
       "1. Disable new registrations",
       "2. Redirect traffic to maintenance page",
       "3. Rollback to previous Shopify app version", 
       "4. Restore previous Locksmith configuration",
       "5. Notify customers of temporary issues",
       "6. Investigate and fix issues",
       "7. Re-deploy when ready"
     ],
     
     timeEstimate: "30-60 minutes for rollback execution",
     
     communication: {
       internal: "Immediate Slack notification to #dev-alerts",
       customers: "Status page update within 15 minutes",
       management: "Email within 1 hour with full details"
     }
   };
   ```

---

## PHASE 7: POST-LAUNCH MONITORING (Days 22-24)

### 7.1 Initial Monitoring Period
**Day 22-24 - Continuous (72 hours)**

**Sub-tasks:**
1. **48-Hour Critical Monitoring**
   ```javascript
   // Critical metrics to watch
   const criticalMetrics = {
     systemHealth: {
       uptime: "> 99.5%",
       responseTime: "< 2 seconds average",
       errorRate: "< 1%"
     },
     
     businessMetrics: {
       registrationAttempts: "Track hourly",
       successRate: "> 80%", 
       userExperience: "No critical user reports"
     },
     
     technicalMetrics: {
       apiResponseTimes: "< 500ms average",
       cacheHitRate: "> 80%",
       databasePerformance: "No slow queries"
     }
   };
   ```

2. **Daily Task Schedule (First Week)**
   ```markdown
   ## Daily Monitoring Tasks (First 7 Days)
   
   ### 9:00 AM - Morning Check
   - [ ] Review overnight error logs
   - [ ] Check registration success rates
   - [ ] Verify system performance metrics
   - [ ] Review pending registration queue
   
   ### 1:00 PM - Midday Check  
   - [ ] Process manual approvals/rejections
   - [ ] Monitor real-time system performance
   - [ ] Review customer feedback/support tickets
   - [ ] Check email notification delivery
   
   ### 6:00 PM - Evening Check
   - [ ] Daily metrics summary
   - [ ] Plan next day improvements
   - [ ] Update stakeholders if needed
   - [ ] Backup verification
   
   ### Emergency Response
   - Response time: < 30 minutes during business hours
   - Escalation: After 1 hour if not resolved
   - Communication: Update customers every 2 hours during issues
   ```

3. **User Feedback Collection**
   ```javascript
   // Feedback collection system
   const feedbackSystem = {
     channels: [
       "In-app feedback form (post-registration)",
       "Email surveys (24 hours after registration)",
       "Customer service tickets",
       "Admin observations and reports"
     ],
     
     categories: [
       "Registration process difficulty",
       "Form field clarity",
       "Error message helpfulness", 
       "Performance issues",
       "Feature requests"
     ],
     
     tracking: {
       responseRate: "Target > 25%",
       satisfaction: "Target > 4.0/5.0",
       issueResolution: "< 24 hours for critical issues"
     }
   };
   ```

4. **Performance Optimization Plan**
   ```javascript
   // Week 1 optimization targets
   const optimizationPlan = {
     identifiedIssues: [
       "Slow address lookup on mobile",
       "Corporate number validation timeout edge cases",
       "Form validation message timing",
       "Cache warming for first-time users"
     ],
     
     implementations: [
       {
         issue: "Mobile performance",
         solution: "Optimize API calls and reduce payload size", 
         timeline: "Within 48 hours",
         priority: "High"
       },
       {
         issue: "Validation timeouts",
         solution: "Implement progressive timeout with retry logic",
         timeline: "Within 72 hours", 
         priority: "Medium"
       }
     ]
   };
   ```

---

## USER ACTIONS REQUIRED SUMMARY

### Critical User Actions
1. **Day 1**: Install Shopify CLI, authenticate, verify development store access
2. **Day 2**: Apply for gBizINFO API token (1-3 business days processing time)
3. **Day 3**: Test corporate number validation with provided test numbers
4. **Day 5**: Performance testing - verify cache performance and response times
5. **Day 9**: Complete form UX testing on multiple devices and browsers
6. **Day 12**: Test manual review queue and email notification system
7. **Day 13**: Install and configure Locksmith app from Shopify App Store
8. **Day 15**: Complete access control testing scenarios
9. **Day 16**: Full end-to-end performance testing with concurrent users
10. **Day 21**: Production environment testing and go-live validation

### Business Stakeholder Actions
1. **Before Day 2**: Provide company information for gBizINFO API application
2. **Day 7-8**: Review and approve Japanese form field translations
3. **Day 14**: Review and approve registration page design and branding
4. **Day 19**: Review admin training materials and user documentation
5. **Day 21**: Final approval for go-live and communication plan execution

### Ongoing User Actions (Post-Launch)
1. **Daily**: Monitor pending registration queue and process approvals
2. **Daily**: Review system performance and error logs
3. **Weekly**: Analyze registration metrics and user feedback
4. **Monthly**: Update wholesaler codes and review system performance

---

## SUCCESS CRITERIA

### Technical Success Metrics
- **Performance**: Registration completion < 10 seconds
- **Reliability**: System uptime > 99.9%
- **Accuracy**: Validation success rate > 95%
- **Security**: Zero security incidents in first month

### Business Success Metrics  
- **Adoption**: Registration completion rate > 80%
- **Efficiency**: Manual processing reduction from 1.5 FTE to 0.2 FTE
- **User Satisfaction**: Customer satisfaction score > 4.0/5.0
- **Growth**: 50% increase in B2B customer registrations within 3 months

This comprehensive plan provides a complete roadmap for implementing the Valrhona Japan B2B Registration System with detailed tasks, sub-tasks, user action requirements, and success criteria that can be followed systematically by an LLM coder.