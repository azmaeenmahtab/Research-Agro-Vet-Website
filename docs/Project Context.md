# PROJECT_CONTEXT.md — Master Bangladesh E-Commerce Architecture & Interactive Agency Planner

## 0. AI AGENT INSTRUCTIONS (READ FIRST BEFORE WRITING ANY CODE)
You are acting as a Principal Full-Stack Architect, Security Engineer, and Digital Marketing Technologist building an agency-grade e-commerce platform tailored for the Bangladesh market.

### MANDATORY STEP 0: Interactive Scope Discovery (Ask First!)
When a developer drops this context file into a new session or asks to plan/start a project, **DO NOT generate application code immediately**. First, greet the developer briefly and ask them to confirm the **Project Configuration & Active Module Tiers**:

1. **Business Niche & Product Structure:** (Default: Licensed Agro-Vet Medicine & Supplements with pack-size variants, Retail MRP vs. Wholesale TP pricing, target animal species, and clinical reference data; adaptable to other niches.)
2. **Locked Tech Stack & Database:** Next.js (App Router) + TypeScript (Strict Mode) + Tailwind CSS + shadcn/ui + **PostgreSQL with Prisma ORM** (chosen for ACID transaction safety on payments and inventory) + `zod` validation.
3. **Active Feature Tier Selection (Ask which Tier to implement in UI/API right now based on client budget):**
   - **[CORE - Always Built]:** Storefront (Home, Catalog, Shared Retail/Wholesale Mode, PDP, Slide-Out Cart, Phone-First Checkout), Unified Admin CMS (Product/Variant Manager, Quick Inline Price/Stock Editor, VIP Client & General Discount Manager, Category/Banner/Coupon Manager, Live Order Dashboard with Audio Alerts, Thermal/A4 Invoice Printer), SSLCommerz + COD, Mandatory SSLCommerz Legal Compliance Pages, Basic `window.dataLayer` Marketing Hooks, and Public Guest Order Tracker (`/track-order`).
   - **[MODULE A - Courier & Logistics]:**
     - `Tier 1 (Basic Budget)`: Manual Courier dropdown (`STEADFAST`, `PATHAO`, `REDX`, `SUNDARBAN`, `MANUAL`), manual tracking code entry, and Courier-ready bulk CSV export.
     - `Tier 2 (Pro Automation Upsell)`: 1-Click API Parcel Booking (`Steadfast`, `Pathao`, `RedX`), automated courier status webhook listeners (`/api/webhooks/courier/[provider]`), and Customer Phone Fraud / Delivery Ratio Checker.
   - **[MODULE B - Digital Marketing & Ad Tracking]:**
     - `Tier 1 (Basic Budget)`: Dynamic Tracking ID settings in Admin (`gtmContainerId`, `metaPixelId`, `googleAdsId`), standardized browser `window.dataLayer` dispatcher (`view_item`, `add_to_cart`, `begin_checkout`, `purchase` with `analyticsEventId`), Dynamic SEO/OpenGraph tags, and automated Meta/Google XML Catalog Feed (`/api/feed/catalog.xml`).
     - `Tier 2 (Pro Marketing Upsell)`: Full Server-Side Meta Conversion API (CAPI) dispatcher with SHA-256 customer hashing and `analyticsEventId` deduplication + Abandoned/Incomplete Checkout Lead Capture table in Admin.
   - **[MODULE C - Customer Communication]:**
     - `Tier 1 (Basic Budget)`: Pre-filled WhatsApp Order/Inquiry button on Product Pages + modular `sendOrderSms()` placeholder hook in backend.
     - `Tier 2 (Pro Comms Upsell)`: Live Bangladeshi SMS Gateway integration (automatic SMS on Order Confirmed/Shipped) + Phone OTP verification.
   - **[MODULE D - AI Product / Veterinary Assistant]:**
     - `Tier 1 (Basic Budget)`: Collapsible "Clinical / AI Reference Data" tab in Admin Product Form stored directly in the `Product` table (`composition`, `indication`, `dosageAndAdministration`), with zero chatbot UI cost.
     - `Tier 2 (Pro AI Upsell)`: Live RAG-powered AI Customer/Veterinary Assistant Chatbot querying clinical columns to recommend medicines by symptoms, species, and weight.

### CRITICAL ARCHITECTURAL LAW: Forward-Compatible Database Schema (Zero-Migration Upsells)
Database columns are free; UI and 3rd-party API integrations are expensive. Even when the developer selects **Tier 1 (Basic Budget)** for Modules A, B, C, or D, you **MUST** use the complete 12-table PostgreSQL Prisma Schema with **100% of the Tier 2 fields already included** (nullable/defaulted). This guarantees the developer can upsell and activate Tier 2 features months later without running destructive database migrations on live client data.

---

## 1. Domain Profile & Audited Agro-Vet Data Specifics
- **Business Type:** Licensed Agro-Vet Medicine, Vaccines & Nutritional Supplements Dealer (Bangladesh).
- **Target Audience:**
  - **B2C Retail Buyers:** Dairy/cattle farmers, poultry farm owners, goat/sheep farmers, aquaculture farmers, and pet owners buying at **MRP (`sellingPrice`)**.
  - **B2B Wholesale Buyers:** Veterinary practitioners, pharmacies, and sub-dealers buying in bulk at **Trade Price (`TP` / `tradePrice`)**.
- **Audited Product Characteristics (33 Initial Products, 20 Clinical Profiles):**
  1. **Bilingual Indexing:** Products have both English (`nameEn`, e.g., `"Re-Live Vet"`) and Bangla (`nameBn`, e.g., `"রি-লিভ ভেট"`) names and clinical text. Search must match English, Bangla, and generic composition.
  2. **Multi-Pack Variants & Box Packaging:** A single medicine sells in multiple pack sizes (e.g., `100 ml`, `500 ml`, `1 Lt`, `3 Lt`, `5 Lt` or `25 gm`, `1 kg`). Small sachets/vials include box metadata (`packagingInfo`: `"1 Box = 20 Pis"`, `unitsPerBox`: `20`).
  3. **Dual Regulatory Identifiers:** Some medicines carry a Department of Livestock Services license (`dlsLicenseNo`, e.g., `"126-18-(07)-005"`), while patented herbal/specialty vet formulations carry a `bangladeshPatentNo` (e.g., `"1005414"`). Both must be supported.
  4. **Target Species Tags (`speciesTags`):** `CATTLE_BUFFALO`, `GOAT_SHEEP`, `POULTRY`, `AQUA`, `PET`.
  5. **6 Core Therapeutic Categories:**
     - `digestive-appetite-care` (ক্ষুধা, হজম ও পেট ফাঁপা)
     - `calcium-milk-bone` (ক্যালসিয়াম ও দুধ বৃদ্ধিকারক)
     - `vitamins-growth-promoters` (ভিটামিন, জিংক ও দৈহিক বৃদ্ধি)
     - `liver-tonic-digestive` (লিভার টনিক ও টক্সিন বাইন্ডার)
     - `reproductive-uterine-care` (প্রজনন ও জরায়ু সুরক্ষা)
     - `electrolytes-diarrhea-wound` (স্যালাইন, ডায়রিয়া ও ক্ষত নিরাময়)

---

## 2. Locked Tech Stack & System Standards
- **Frontend & SSR:** Next.js (App Router), TypeScript (Strict Mode — zero `any`), Tailwind CSS, shadcn/ui.
- **Client State:** Zustand (persistent `localStorage` cart, active `buyerMode: "RETAIL" | "WHOLESALE"`, and checkout draft state).
- **Backend & Real-Time:** Next.js Route Handlers / Server Actions + Server-Sent Events (SSE) / WebSockets / short-interval polling for live Admin order notifications.
- **Database & ORM:** **PostgreSQL + Prisma ORM** (`prisma.$transaction` used for atomic order creation, inventory deduction, and idempotent SSLCommerz IPN verification).
- **Validation:** `zod` schema validation on every API payload and admin form submission.
- **Media Storage:** Cloudinary / AWS S3 / UploadThing with automatic WebP optimization.
- **Payment Gateway:** SSLCommerz (Hosted Checkout + Server-to-Server IPN Listener + Order Validation Webservice API) + Cash on Delivery (COD) + Partial Delivery Charge Advance.

---

## 3. Master 12-Table PostgreSQL Prisma Architecture
1. **`AdminUser`**: Role-based access (`SUPER_ADMIN`, `ADMIN`, `STAFF`) for `/admin`.
2. **`Category`**: Bilingual categories (`nameEn`, `nameBn`, `slug`, `sortOrder`, `isActive`, SEO fields).
3. **`Product`**: Core medicine info (`legacyCatalogId`, `nameEn`, `nameBn`, `slug`, `formFactor`, `speciesTags[]`), regulatory info (`dlsLicenseNo`, `bangladeshPatentNo`), media, and **1-to-1 Clinical/AI Chatbot columns** (`composition`, `indication`, `dosageAndAdministration`, `withdrawalPeriod`, `contraindications`, `storageInstructions`, `searchKeywords[]`).
4. **`ProductVariant`**: Linked to `Product` via `productId`. Stores `sku`, `packSize`, `weightGrams`, `packagingInfo`, `unitsPerBox`, **3 Price Columns** (`tradePrice` [TP], `mrpPrice` [MRP], `sellingPrice` [defaults to `mrpPrice`]), **Nullable Per-Product Wholesale Overrides** (`minWholesaleQty`, `minWholesaleAmount`), and inventory (`stockQuantity`, `inStock`, `isDefault`).
5. **`CustomerProfile`**: Keyed by 11-digit BD mobile number (`phone`). Stores client/farm name, `defaultPriceTier` (`RETAIL` | `WHOLESALE`), `bypassWholesaleMinimum` (boolean for VIP dealers), and **Priority 1 Per-Client Custom Discount** (`hasCustomDiscount`, `discountType`, `discountValue`, `minOrderForDiscount`).
6. **`Order`**: Stores `orderNumber`, `orderType` (`RETAIL` | `WHOLESALE`), customer snapshot, link to `CustomerProfile`, server-calculated financials, discount audit trail (`appliedDiscountSource`, `appliedDiscountLabel`), SSLCommerz consent (`agreedToPolicies`), **Courier Block** (`courierProvider`, `consignmentId`, `trackingCode`, `courierStatus`, `codCollectableAmount`, `courierWebhookLogs`), and **Marketing Block** (`analyticsEventId`, `clientIp`, `userAgent`, `fbc`, `fbp`, `capiPurchaseSent`).
7. **`OrderItem`**: Immutable line-item snapshot (`priceTierApplied`, `unitTradePrice`, `unitMrpPrice`, `unitSellingPrice`, `quantity`, `lineTotal`).
8. **`Transaction`**: SSLCommerz audit log (`tranId`, `valId`, `bankTranId`, `amount`, `storeAmount`, `cardType`, `status`, `riskLevel`, `rawIpnPayload`).
9. **`Coupon`**: Promo codes (`code`, `discountType`, `discountValue`, `minOrderAmount`, `maxDiscountCap`, `applicableOrderType`, `usageLimit`, `expiresAt`).
10. **`IncompleteLead`**: Captures abandoned checkouts on phone input blur (`phone`, `name`, `cartItems`, `cartTotal`, `status`, `convertedOrderId`).
11. **`HeroBanner`**: Storefront homepage promotional banners.
12. **`SiteSettings`**: Single-row global config for Store Info, Licenses (`tradeLicenseNo`, `dlsDealerLicenseNo`, `dbidNumber`), Shipping Rates (`insideDistrictFee`, `outsideDistrictFee`, `freeShippingThreshold