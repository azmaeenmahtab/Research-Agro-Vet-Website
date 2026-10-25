CREATE TABLE "AdminUser" (
  "id" varchar PRIMARY KEY,
  "name" varchar,
  "email" varchar UNIQUE,
  "phone" varchar UNIQUE,
  "passwordHash" varchar,
  "role" varchar,
  "isActive" boolean,
  "lastLoginAt" timestamp,
  "createdAt" timestamp
);

CREATE TABLE "Category" (
  "id" varchar PRIMARY KEY,
  "nameEn" varchar,
  "nameBn" varchar,
  "slug" varchar UNIQUE,
  "description" text,
  "image" varchar,
  "sortOrder" int,
  "isActive" boolean,
  "metaTitle" varchar,
  "metaDescription" varchar,
  "createdAt" timestamp
);

CREATE TABLE "Product" (
  "id" varchar PRIMARY KEY,
  "legacyCatalogId" int UNIQUE,
  "categoryId" varchar,
  "nameEn" varchar,
  "nameBn" varchar,
  "slug" varchar UNIQUE,
  "formFactor" varchar,
  "speciesTags" varchar[],
  "dlsLicenseNo" varchar,
  "bangladeshPatentNo" varchar,
  "manufacturer" varchar,
  "thumbnail" varchar,
  "images" varchar[],
  "shortDescription" text,
  "composition" text,
  "indication" text,
  "dosageAndAdministration" text,
  "withdrawalPeriod" varchar,
  "contraindications" text,
  "storageInstructions" varchar,
  "searchKeywords" varchar[],
  "isFeatured" boolean,
  "isBestSeller" boolean,
  "status" varchar,
  "createdAt" timestamp
);

CREATE TABLE "ProductVariant" (
  "id" varchar PRIMARY KEY,
  "productId" varchar NOT NULL,
  "sku" varchar UNIQUE,
  "packSize" varchar,
  "weightGrams" int,
  "packagingInfo" varchar,
  "unitsPerBox" int,
  "tradePrice" decimal,
  "mrpPrice" decimal,
  "sellingPrice" decimal,
  "minWholesaleQty" int,
  "minWholesaleAmount" decimal,
  "stockQuantity" int,
  "inStock" boolean,
  "isDefault" boolean,
  "sortOrder" int
);

CREATE TABLE "CustomerProfile" (
  "id" varchar PRIMARY KEY,
  "phone" varchar UNIQUE,
  "name" varchar,
  "businessOrFarmName" varchar,
  "email" varchar,
  "district" varchar,
  "upazila" varchar,
  "address" text,
  "defaultPriceTier" varchar,
  "bypassWholesaleMinimum" boolean,
  "hasCustomDiscount" boolean,
  "discountType" varchar,
  "discountValue" decimal,
  "minOrderForDiscount" decimal,
  "totalOrdersCount" int,
  "deliveredOrdersCount" int,
  "cancelledOrReturnedCnt" int,
  "isActive" boolean,
  "createdAt" timestamp
);

CREATE TABLE "Order" (
  "id" varchar PRIMARY KEY,
  "orderNumber" varchar UNIQUE,
  "orderType" varchar,
  "customerProfileId" varchar,
  "customerName" varchar,
  "customerPhone" varchar,
  "district" varchar,
  "upazila" varchar,
  "address" text,
  "subtotal" decimal,
  "discountAmount" decimal,
  "appliedDiscountSource" varchar,
  "appliedDiscountLabel" varchar,
  "couponCode" varchar,
  "shippingFee" decimal,
  "grandTotal" decimal,
  "paidAmount" decimal,
  "dueAmount" decimal,
  "paymentMethod" varchar,
  "paymentStatus" varchar,
  "orderStatus" varchar,
  "agreedToPolicies" boolean,
  "courierProvider" varchar,
  "consignmentId" varchar,
  "trackingCode" varchar,
  "courierStatus" varchar,
  "codCollectableAmount" decimal,
  "analyticsEventId" varchar UNIQUE,
  "capiPurchaseSent" boolean,
  "createdAt" timestamp
);

CREATE TABLE "OrderItem" (
  "id" varchar PRIMARY KEY,
  "orderId" varchar NOT NULL,
  "productId" varchar NOT NULL,
  "variantId" varchar NOT NULL,
  "nameEn" varchar,
  "nameBn" varchar,
  "packSize" varchar,
  "sku" varchar,
  "priceTierApplied" varchar,
  "unitTradePrice" decimal,
  "unitMrpPrice" decimal,
  "unitSellingPrice" decimal,
  "quantity" int,
  "lineTotal" decimal
);

CREATE TABLE "Transaction" (
  "id" varchar PRIMARY KEY,
  "orderId" varchar NOT NULL,
  "tranId" varchar UNIQUE,
  "valId" varchar,
  "bankTranId" varchar,
  "amount" decimal,
  "storeAmount" decimal,
  "currency" varchar,
  "cardType" varchar,
  "status" varchar,
  "riskLevel" int,
  "rawIpnPayload" json,
  "validatedAt" timestamp,
  "createdAt" timestamp
);

CREATE TABLE "Coupon" (
  "id" varchar PRIMARY KEY,
  "code" varchar UNIQUE,
  "discountType" varchar,
  "discountValue" decimal,
  "minOrderAmount" decimal,
  "maxDiscountCap" decimal,
  "applicableOrderType" varchar,
  "usageLimit" int,
  "usedCount" int,
  "expiresAt" timestamp,
  "isActive" boolean
);

CREATE TABLE "IncompleteLead" (
  "id" varchar PRIMARY KEY,
  "phone" varchar,
  "name" varchar,
  "district" varchar,
  "orderType" varchar,
  "cartItems" json,
  "cartTotal" decimal,
  "status" varchar,
  "convertedOrderId" varchar,
  "updatedAt" timestamp
);

CREATE TABLE "HeroBanner" (
  "id" varchar PRIMARY KEY,
  "title" varchar,
  "subtitle" varchar,
  "imageUrl" varchar,
  "ctaText" varchar,
  "ctaLink" varchar,
  "sortOrder" int,
  "isActive" boolean
);

CREATE TABLE "SiteSettings" (
  "id" varchar PRIMARY KEY,
  "storeName" varchar,
  "supportPhone" varchar,
  "whatsappNumber" varchar,
  "tradeLicenseNo" varchar,
  "dlsDealerLicenseNo" varchar,
  "insideDistrictName" varchar,
  "insideDistrictFee" decimal,
  "outsideDistrictFee" decimal,
  "freeShippingThreshold" decimal,
  "wholesaleRuleMode" varchar,
  "globalMinWholesaleAmount" decimal,
  "globalMinWholesaleQty" int,
  "enableGeneralDiscount" boolean,
  "generalRetailDiscountPercent" decimal,
  "generalWholesaleDiscountPct" decimal,
  "gtmContainerId" varchar,
  "metaPixelId" varchar,
  "metaConversionApiToken" varchar,
  "googleAdsId" varchar
);

COMMENT ON COLUMN "AdminUser"."role" IS 'SUPER_ADMIN | ADMIN | STAFF';

COMMENT ON COLUMN "Product"."legacyCatalogId" IS '1..33 from client PDF';

COMMENT ON COLUMN "Product"."formFactor" IS 'POWDER | LIQUID | SACHET | BOLUS | SOLUTION';

COMMENT ON COLUMN "Product"."speciesTags" IS 'CATTLE_BUFFALO, POULTRY, GOAT_SHEEP, AQUA';

COMMENT ON COLUMN "Product"."composition" IS '1-to-1 Clinical & AI RAG Data';

COMMENT ON COLUMN "Product"."indication" IS '1-to-1 Clinical & AI RAG Data';

COMMENT ON COLUMN "Product"."dosageAndAdministration" IS '1-to-1 Clinical & AI RAG Data';

COMMENT ON COLUMN "Product"."status" IS 'ACTIVE | DRAFT | ARCHIVED';

COMMENT ON COLUMN "ProductVariant"."packSize" IS '100 ml, 1 kg, 25 gm, 5 Lt';

COMMENT ON COLUMN "ProductVariant"."packagingInfo" IS 'e.g. 1 Box = 20 Pis';

COMMENT ON COLUMN "ProductVariant"."tradePrice" IS 'Wholesale TP Price';

COMMENT ON COLUMN "ProductVariant"."mrpPrice" IS 'Printed Retail MRP';

COMMENT ON COLUMN "ProductVariant"."sellingPrice" IS 'Default Online Retail Price';

COMMENT ON COLUMN "ProductVariant"."minWholesaleQty" IS 'Nullable: Per-product override for TP';

COMMENT ON COLUMN "ProductVariant"."minWholesaleAmount" IS 'Nullable: Per-product min BDT for TP';

COMMENT ON COLUMN "CustomerProfile"."phone" IS '11-digit BD Phone Key';

COMMENT ON COLUMN "CustomerProfile"."defaultPriceTier" IS 'RETAIL | WHOLESALE';

COMMENT ON COLUMN "CustomerProfile"."hasCustomDiscount" IS 'Priority 1 Client Discount';

COMMENT ON COLUMN "CustomerProfile"."discountType" IS 'PERCENTAGE | FIXED';

COMMENT ON COLUMN "Order"."orderNumber" IS 'e.g. AV-2610-0001';

COMMENT ON COLUMN "Order"."orderType" IS 'RETAIL (MRP) | WHOLESALE (TP)';

COMMENT ON COLUMN "Order"."customerProfileId" IS 'Nullable link to VIP/Client profile';

COMMENT ON COLUMN "Order"."appliedDiscountSource" IS 'CLIENT_CUSTOM | GENERAL_STOREWIDE | COUPON | ADMIN_MANUAL';

COMMENT ON COLUMN "Order"."paymentMethod" IS 'SSLCOMMERZ | COD | PARTIAL_ADVANCE';

COMMENT ON COLUMN "Order"."paymentStatus" IS 'UNPAID | PAID | PARTIAL | FAILED | REFUNDED';

COMMENT ON COLUMN "Order"."orderStatus" IS 'PENDING | CONFIRMED | PACKED | SHIPPED | DELIVERED | CANCELLED';

COMMENT ON COLUMN "Order"."courierProvider" IS 'STEADFAST | PATHAO | REDX | SUNDARBAN | MANUAL';

COMMENT ON COLUMN "Order"."analyticsEventId" IS 'Deduplication ID for Browser Pixel + Meta CAPI';

COMMENT ON COLUMN "OrderItem"."priceTierApplied" IS 'RETAIL | WHOLESALE';

COMMENT ON COLUMN "Transaction"."tranId" IS 'SSLCommerz tran_id';

COMMENT ON COLUMN "Transaction"."valId" IS 'SSLCommerz val_id';

COMMENT ON COLUMN "Transaction"."status" IS 'INITIATED | VALID | VALIDATED | FAILED | CANCELLED';

COMMENT ON COLUMN "Coupon"."discountType" IS 'PERCENTAGE | FIXED';

COMMENT ON COLUMN "IncompleteLead"."status" IS 'NEW | CALLED | CONVERTED | IGNORED';

COMMENT ON COLUMN "SiteSettings"."id" IS 'Single row: default';

COMMENT ON COLUMN "SiteSettings"."wholesaleRuleMode" IS 'GLOBAL_ONLY | PER_PRODUCT_ONLY | HYBRID_EITHER';

COMMENT ON COLUMN "SiteSettings"."enableGeneralDiscount" IS 'Priority 2 General Discount';

ALTER TABLE "Product" ADD FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "ProductVariant" ADD FOREIGN KEY ("productId") REFERENCES "Product" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Order" ADD FOREIGN KEY ("customerProfileId") REFERENCES "CustomerProfile" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "OrderItem" ADD FOREIGN KEY ("orderId") REFERENCES "Order" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "OrderItem" ADD FOREIGN KEY ("productId") REFERENCES "Product" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "OrderItem" ADD FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Transaction" ADD FOREIGN KEY ("orderId") REFERENCES "Order" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "IncompleteLead" ADD FOREIGN KEY ("convertedOrderId") REFERENCES "Order" ("id") DEFERRABLE INITIALLY IMMEDIATE;
