const { Client } = require('pg');
const { PrismaClient } = require('@prisma/client');

async function migrate() {
  console.log('🚀 Starting PostgreSQL to MySQL Zero-Loss ETL Migration...\n');

  // 1. Connect to PostgreSQL
  const pgClient = new Client({
    connectionString: 'postgresql://postgres:itzmahtabpgadmin007@localhost:5432/research-agro-vet-database',
  });
  await pgClient.connect();
  console.log('✅ Connected to source PostgreSQL (research-agro-vet-database)');

  // 2. Connect to MySQL via Prisma
  const prisma = new PrismaClient();
  await prisma.$connect();
  console.log('✅ Connected to destination MySQL (researchagrovetdb)\n');

  try {
    // ----------------------------------------------------
    // Step A: Users & Better Auth
    // ----------------------------------------------------
    const { rows: users } = await pgClient.query('SELECT * FROM "user"');
    console.log(`📦 Migrating ${users.length} Better Auth users...`);
    for (const u of users) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: {},
        create: {
          id: u.id,
          name: u.name,
          email: u.email,
          emailVerified: u.emailVerified ?? false,
          image: u.image,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          role: u.role,
          banned: u.banned,
          banReason: u.banReason,
          banExpires: u.banExpires,
        },
      });
    }

    const { rows: accounts } = await pgClient.query('SELECT * FROM "account"');
    console.log(`📦 Migrating ${accounts.length} Better Auth accounts...`);
    for (const a of accounts) {
      await prisma.account.upsert({
        where: { id: a.id },
        update: {},
        create: {
          id: a.id,
          accountId: a.accountId,
          providerId: a.providerId,
          userId: a.userId,
          accessToken: a.accessToken,
          refreshToken: a.refreshToken,
          idToken: a.idToken,
          accessTokenExpiresAt: a.accessTokenExpiresAt,
          refreshTokenExpiresAt: a.refreshTokenExpiresAt,
          scope: a.scope,
          password: a.password,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        },
      });
    }

    const { rows: adminUsers } = await pgClient.query('SELECT * FROM "AdminUser"');
    console.log(`📦 Migrating ${adminUsers.length} AdminUser records...`);
    for (const au of adminUsers) {
      await prisma.adminUser.upsert({
        where: { id: au.id },
        update: {},
        create: {
          id: au.id,
          name: au.name,
          email: au.email,
          phone: au.phone,
          passwordHash: au.passwordHash,
          role: au.role,
          isActive: au.isActive,
          lastLoginAt: au.lastLoginAt,
          createdAt: au.createdAt,
          updatedAt: au.updatedAt,
        },
      });
    }

    // ----------------------------------------------------
    // Step B: Categories
    // ----------------------------------------------------
    const { rows: categories } = await pgClient.query('SELECT * FROM "Category"');
    console.log(`📦 Migrating ${categories.length} Categories...`);
    for (const c of categories) {
      await prisma.category.upsert({
        where: { id: c.id },
        update: {},
        create: {
          id: c.id,
          nameEn: c.nameEn,
          nameBn: c.nameBn,
          slug: c.slug,
          description: c.description,
          image: c.image,
          sortOrder: c.sortOrder ?? 0,
          isActive: c.isActive ?? true,
          metaTitle: c.metaTitle,
          metaDescription: c.metaDescription,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        },
      });
    }

    // ----------------------------------------------------
    // Step C: Products (Transform Arrays to JSON)
    // ----------------------------------------------------
    const { rows: products } = await pgClient.query('SELECT * FROM "Product"');
    console.log(`📦 Migrating ${products.length} Products...`);
    for (const p of products) {
      await prisma.product.upsert({
        where: { id: p.id },
        update: {},
        create: {
          id: p.id,
          legacyCatalogId: p.legacyCatalogId,
          nameEn: p.nameEn,
          nameBn: p.nameBn,
          slug: p.slug,
          formFactor: p.formFactor,
          speciesTags: Array.isArray(p.speciesTags) ? p.speciesTags : (p.speciesTags || []),
          dlsLicenseNo: p.dlsLicenseNo,
          bangladeshPatentNo: p.bangladeshPatentNo,
          manufacturer: p.manufacturer,
          thumbnail: p.thumbnail,
          images: Array.isArray(p.images) ? p.images : (p.images || []),
          shortDescription: p.shortDescription,
          composition: p.composition,
          indication: p.indication,
          dosageAndAdministration: p.dosageAndAdministration,
          withdrawalPeriod: p.withdrawalPeriod,
          contraindications: p.contraindications,
          storageInstructions: p.storageInstructions,
          searchKeywords: Array.isArray(p.searchKeywords) ? p.searchKeywords : (p.searchKeywords || []),
          isFeatured: p.isFeatured ?? false,
          isBestSeller: p.isBestSeller ?? false,
          status: p.status ?? 'ACTIVE',
          metaTitle: p.metaTitle,
          metaDescription: p.metaDescription,
          categoryId: p.categoryId,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        },
      });
    }

    // ----------------------------------------------------
    // Step D: Product to Category Many-to-Many
    // ----------------------------------------------------
    const { rows: prodToCat } = await pgClient.query('SELECT * FROM "_ProductToCategory"');
    console.log(`📦 Migrating ${prodToCat.length} Product-to-Category relations...`);
    for (const rel of prodToCat) {
      await prisma.$executeRawUnsafe(
        'INSERT IGNORE INTO `_producttocategory` (`A`, `B`) VALUES (?, ?)',
        rel.A,
        rel.B
      );
    }

    // ----------------------------------------------------
    // Step E: Product Variants
    // ----------------------------------------------------
    const { rows: variants } = await pgClient.query('SELECT * FROM "ProductVariant"');
    console.log(`📦 Migrating ${variants.length} Product Variants...`);
    for (const v of variants) {
      await prisma.productVariant.upsert({
        where: { id: v.id },
        update: {},
        create: {
          id: v.id,
          productId: v.productId,
          sku: v.sku,
          packSize: v.packSize,
          weightGrams: v.weightGrams ?? 100,
          packagingInfo: v.packagingInfo,
          unitsPerBox: v.unitsPerBox,
          tradePrice: v.tradePrice,
          mrpPrice: v.mrpPrice,
          sellingPrice: v.sellingPrice,
          minWholesaleQty: v.minWholesaleQty,
          minWholesaleAmount: v.minWholesaleAmount,
          stockQuantity: v.stockQuantity ?? 100,
          inStock: v.inStock ?? true,
          isDefault: v.isDefault ?? false,
          sortOrder: v.sortOrder ?? 0,
          createdAt: v.createdAt,
          updatedAt: v.updatedAt,
        },
      });
    }

    // ----------------------------------------------------
    // Step F: Product Reviews
    // ----------------------------------------------------
    const { rows: reviews } = await pgClient.query('SELECT * FROM "ProductReview"');
    console.log(`📦 Migrating ${reviews.length} Product Reviews...`);
    for (const r of reviews) {
      await prisma.productReview.upsert({
        where: { id: r.id },
        update: {},
        create: {
          id: r.id,
          productId: r.productId,
          userName: r.userName,
          userPhone: r.userPhone,
          farmerType: r.farmerType,
          rating: r.rating ?? 5,
          title: r.title,
          comment: r.comment,
          isVerified: r.isVerified ?? false,
          status: r.status ?? 'APPROVED',
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        },
      });
    }

    // ----------------------------------------------------
    // Step G: Customer Profiles
    // ----------------------------------------------------
    const { rows: customers } = await pgClient.query('SELECT * FROM "CustomerProfile"');
    console.log(`📦 Migrating ${customers.length} Customer Profiles...`);
    for (const cp of customers) {
      await prisma.customerProfile.upsert({
        where: { id: cp.id },
        update: {},
        create: {
          id: cp.id,
          phone: cp.phone,
          name: cp.name,
          businessOrFarmName: cp.businessOrFarmName,
          email: cp.email,
          district: cp.district,
          upazila: cp.upazila,
          address: cp.address,
          defaultPriceTier: cp.defaultPriceTier,
          bypassWholesaleMinimum: cp.bypassWholesaleMinimum ?? false,
          hasCustomDiscount: cp.hasCustomDiscount ?? false,
          discountType: cp.discountType,
          discountValue: cp.discountValue ?? 0,
          minOrderForDiscount: cp.minOrderForDiscount ?? 0,
          totalOrdersCount: cp.totalOrdersCount ?? 0,
          deliveredOrdersCount: cp.deliveredOrdersCount ?? 0,
          cancelledOrReturnedCnt: cp.cancelledOrReturnedCnt ?? 0,
          adminNotes: cp.adminNotes,
          isActive: cp.isActive ?? true,
          createdAt: cp.createdAt,
          updatedAt: cp.updatedAt,
        },
      });
    }

    // ----------------------------------------------------
    // Step H: Orders, Items & Transactions
    // ----------------------------------------------------
    const { rows: orders } = await pgClient.query('SELECT * FROM "Order"');
    console.log(`📦 Migrating ${orders.length} Orders...`);
    for (const o of orders) {
      await prisma.order.upsert({
        where: { id: o.id },
        update: {},
        create: {
          id: o.id,
          orderNumber: o.orderNumber,
          orderType: o.orderType,
          customerProfileId: o.customerProfileId,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          customerAltPhone: o.customerAltPhone,
          customerEmail: o.customerEmail,
          district: o.district,
          upazila: o.upazila,
          address: o.address,
          orderNote: o.orderNote,
          subtotal: o.subtotal,
          discountAmount: o.discountAmount ?? 0,
          appliedDiscountSource: o.appliedDiscountSource,
          appliedDiscountLabel: o.appliedDiscountLabel,
          couponCode: o.couponCode,
          shippingFee: o.shippingFee,
          grandTotal: o.grandTotal,
          paidAmount: o.paidAmount ?? 0,
          dueAmount: o.dueAmount,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          orderStatus: o.orderStatus,
          agreedToPolicies: o.agreedToPolicies ?? true,
          courierProvider: o.courierProvider,
          consignmentId: o.consignmentId,
          trackingCode: o.trackingCode,
          trackingUrl: o.trackingUrl,
          courierStatus: o.courierStatus,
          codCollectableAmount: o.codCollectableAmount,
          dispatchedAt: o.dispatchedAt,
          deliveredAt: o.deliveredAt,
          courierWebhookLogs: o.courierWebhookLogs,
          analyticsEventId: o.analyticsEventId,
          clientIp: o.clientIp,
          userAgent: o.userAgent,
          fbc: o.fbc,
          fbp: o.fbp,
          utmSource: o.utmSource,
          utmMedium: o.utmMedium,
          utmCampaign: o.utmCampaign,
          capiPurchaseSent: o.capiPurchaseSent ?? false,
          notificationsSent: o.notificationsSent,
          adminNotes: o.adminNotes,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
        },
      });
    }

    const { rows: orderItems } = await pgClient.query('SELECT * FROM "OrderItem"');
    console.log(`📦 Migrating ${orderItems.length} Order Items...`);
    for (const oi of orderItems) {
      await prisma.orderItem.upsert({
        where: { id: oi.id },
        update: {},
        create: {
          id: oi.id,
          orderId: oi.orderId,
          productId: oi.productId,
          variantId: oi.variantId,
          nameEn: oi.nameEn,
          nameBn: oi.nameBn,
          packSize: oi.packSize,
          sku: oi.sku,
          priceTierApplied: oi.priceTierApplied,
          unitTradePrice: oi.unitTradePrice,
          unitMrpPrice: oi.unitMrpPrice,
          unitSellingPrice: oi.unitSellingPrice,
          quantity: oi.quantity,
          lineTotal: oi.lineTotal,
        },
      });
    }

    const { rows: transactions } = await pgClient.query('SELECT * FROM "Transaction"');
    console.log(`📦 Migrating ${transactions.length} Transactions...`);
    for (const t of transactions) {
      await prisma.transaction.upsert({
        where: { id: t.id },
        update: {},
        create: {
          id: t.id,
          orderId: t.orderId,
          tranId: t.tranId,
          valId: t.valId,
          bankTranId: t.bankTranId,
          amount: t.amount,
          storeAmount: t.storeAmount,
          currency: t.currency ?? 'BDT',
          cardType: t.cardType,
          cardBrand: t.cardBrand,
          cardIssuer: t.cardIssuer,
          status: t.status,
          riskLevel: t.riskLevel ?? 0,
          rawIpnPayload: t.rawIpnPayload,
          refundHistory: t.refundHistory,
          validatedAt: t.validatedAt,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        },
      });
    }

    // ----------------------------------------------------
    // Step I: Coupons & Hero Banners & Incomplete Leads
    // ----------------------------------------------------
    const { rows: coupons } = await pgClient.query('SELECT * FROM "Coupon"');
    console.log(`📦 Migrating ${coupons.length} Coupons...`);
    for (const cp of coupons) {
      await prisma.coupon.upsert({
        where: { id: cp.id },
        update: {},
        create: {
          id: cp.id,
          code: cp.code,
          description: cp.description,
          discountType: cp.discountType,
          discountValue: cp.discountValue,
          minOrderAmount: cp.minOrderAmount ?? 0,
          maxDiscountCap: cp.maxDiscountCap,
          applicableOrderType: cp.applicableOrderType,
          usageLimit: cp.usageLimit,
          usedCount: cp.usedCount ?? 0,
          startsAt: cp.startsAt,
          expiresAt: cp.expiresAt,
          isActive: cp.isActive ?? true,
          createdAt: cp.createdAt,
          updatedAt: cp.updatedAt,
        },
      });
    }

    const { rows: banners } = await pgClient.query('SELECT * FROM "HeroBanner"');
    console.log(`📦 Migrating ${banners.length} Hero Banners...`);
    for (const hb of banners) {
      await prisma.heroBanner.upsert({
        where: { id: hb.id },
        update: {},
        create: {
          id: hb.id,
          title: hb.title,
          subtitle: hb.subtitle,
          badgeText: hb.badgeText,
          imageUrl: hb.imageUrl,
          mobileUrl: hb.mobileUrl,
          ctaText: hb.ctaText,
          ctaLink: hb.ctaLink,
          sortOrder: hb.sortOrder ?? 0,
          isActive: hb.isActive ?? true,
          createdAt: hb.createdAt,
          updatedAt: hb.updatedAt,
        },
      });
    }

    const { rows: leads } = await pgClient.query('SELECT * FROM "IncompleteLead"');
    console.log(`📦 Migrating ${leads.length} Incomplete Leads...`);
    for (const il of leads) {
      await prisma.incompleteLead.upsert({
        where: { id: il.id },
        update: {},
        create: {
          id: il.id,
          phone: il.phone,
          name: il.name,
          district: il.district,
          upazila: il.upazila,
          address: il.address,
          orderType: il.orderType,
          cartItems: il.cartItems,
          cartTotal: il.cartTotal,
          status: il.status,
          adminNotes: il.adminNotes,
          convertedOrderId: il.convertedOrderId,
          createdAt: il.createdAt,
          updatedAt: il.updatedAt,
        },
      });
    }

    // ----------------------------------------------------
    // Step J: Site Settings
    // ----------------------------------------------------
    const { rows: settings } = await pgClient.query('SELECT * FROM "SiteSettings"');
    console.log(`📦 Migrating ${settings.length} Site Settings...`);
    for (const s of settings) {
      await prisma.siteSettings.upsert({
        where: { id: s.id },
        update: {},
        create: {
          id: s.id,
          storeName: s.storeName,
          storeTagline: s.storeTagline,
          supportPhone: s.supportPhone,
          whatsappNumber: s.whatsappNumber,
          supportEmail: s.supportEmail,
          physicalAddress: s.physicalAddress,
          tradeLicenseNo: s.tradeLicenseNo,
          dlsDealerLicenseNo: s.dlsDealerLicenseNo,
          dbidNumber: s.dbidNumber,
          refundTimelineText: s.refundTimelineText,
          insideDeliveryTimelineText: s.insideDeliveryTimelineText,
          outsideDeliveryTimelineText: s.outsideDeliveryTimelineText,
          insideDistrictName: s.insideDistrictName,
          insideDistrictFee: s.insideDistrictFee,
          outsideDistrictFee: s.outsideDistrictFee,
          freeShippingThreshold: s.freeShippingThreshold,
          wholesaleRuleMode: s.wholesaleRuleMode,
          globalMinWholesaleAmount: s.globalMinWholesaleAmount,
          globalMinWholesaleQty: s.globalMinWholesaleQty,
          enableGeneralDiscount: s.enableGeneralDiscount ?? false,
          generalRetailDiscountPercent: s.generalRetailDiscountPercent ?? 0,
          generalWholesaleDiscountPct: s.generalWholesaleDiscountPct ?? 0,
          gtmContainerId: s.gtmContainerId,
          metaPixelId: s.metaPixelId,
          metaConversionApiToken: s.metaConversionApiToken,
          metaTestEventCode: s.metaTestEventCode,
          googleAdsId: s.googleAdsId,
          tiktokPixelId: s.tiktokPixelId,
          steadfastApiKey: s.steadfastApiKey,
          steadfastSecretKey: s.steadfastSecretKey,
          pathaoClientId: s.pathaoClientId,
          pathaoClientSecret: s.pathaoClientSecret,
          redxAccessToken: s.redxAccessToken,
          smsGatewayUrl: s.smsGatewayUrl,
          smsApiKey: s.smsApiKey,
          smsSenderId: s.smsSenderId,
          enableAutoOrderSms: s.enableAutoOrderSms ?? false,
          updatedAt: s.updatedAt,
        },
      });
    }

    console.log('\n🎉 ALL DATA MIGRATION COMPLETED SUCCESSFULLY!');
    
    // Final Audit Comparison
    const [pCount, vCount, cCount, oCount, uCount] = await Promise.all([
      prisma.product.count(),
      prisma.productVariant.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.user.count(),
    ]);

    console.log('\n📊 Destination MySQL Verification Audit:');
    console.log(`- Products: ${pCount} (Source: ${products.length})`);
    console.log(`- Product Variants: ${vCount} (Source: ${variants.length})`);
    console.log(`- Categories: ${cCount} (Source: ${categories.length})`);
    console.log(`- Orders: ${oCount} (Source: ${orders.length})`);
    console.log(`- Users: ${uCount} (Source: ${users.length})`);

  } catch (err) {
    console.error('❌ Data migration failed:', err);
    throw err;
  } finally {
    await pgClient.end();
    await prisma.$disconnect();
  }
}

migrate();

