import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, BuyerTier, DiscountSource } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerAltPhone,
      district,
      upazila,
      address,
      orderNote,
      items,
      buyerMode = 'RETAIL',
    } = body;

    // 1. Basic Validation
    if (!customerName || !customerName.trim()) {
      return NextResponse.json(
        { success: false, message: 'গ্রাহকের নাম প্রদান করা আবশ্যক (Customer name is required)' },
        { status: 400 }
      );
    }

    const cleanPhone = (customerPhone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
      return NextResponse.json(
        { success: false, message: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (Valid 11-digit BD mobile required: 01XXXXXXXXX)' },
        { status: 400 }
      );
    }

    if (!district || !district.trim()) {
      return NextResponse.json(
        { success: false, message: 'জেলা নির্বাচন করুন (Please select a district)' },
        { status: 400 }
      );
    }

    if (!upazila || !upazila.trim()) {
      return NextResponse.json(
        { success: false, message: 'উপজেলা / থানার নাম লিখুন (Please enter your Upazila / Thana)' },
        { status: 400 }
      );
    }

    if (!address || !address.trim()) {
      return NextResponse.json(
        { success: false, message: 'সম্পূর্ণ ঠিকানা লিখুন (Please enter your delivery address)' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'কার্ট খালি, অন্তত একটি পণ্য নির্বাচন করুন (Cart is empty)' },
        { status: 400 }
      );
    }

    // 2. Fetch Variant & Product Data from DB (Zero-Trust Pricing)
    const variantIds = items.map((i: any) => i.variantId);
    const dbVariants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: {
          select: {
            id: true,
            nameEn: true,
            nameBn: true,
            status: true,
          },
        },
      },
    });

    if (dbVariants.length === 0) {
      return NextResponse.json(
        { success: false, message: 'নির্বাচিত পণ্য পাওয়া যায়নি (No valid products found)' },
        { status: 400 }
      );
    }

    const isWholesale = buyerMode === 'WHOLESALE';

    // 3. Compute Itemized Totals & Subtotal
    // 3. Query SiteSettings for Universal Discount Policy
    const siteSettings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
      select: { enableGeneralDiscount: true, generalRetailDiscountPercent: true },
    });

    const isUniversalEnabled = Boolean(siteSettings?.enableGeneralDiscount);
    const universalPercent = isUniversalEnabled ? (Number(siteSettings?.generalRetailDiscountPercent) || 0) : 0;
    const universalRate = universalPercent / 100;

    let baselineSubtotal = 0;
    let actualItemsPayable = 0;
    let individualDiscountSum = 0;
    let universalDiscountSum = 0;
    let hasIndividualDiscount = false;

    const orderItemData: Array<{
      productId: string;
      variantId: string;
      nameEn: string;
      nameBn?: string | null;
      packSize: string;
      sku: string;
      priceTierApplied: BuyerTier;
      unitTradePrice: Prisma.Decimal;
      unitMrpPrice: Prisma.Decimal;
      unitSellingPrice: Prisma.Decimal;
      quantity: number;
      lineTotal: Prisma.Decimal;
    }> = [];

    for (const item of items) {
      const variant = dbVariants.find((v) => v.id === item.variantId);
      if (!variant) continue;

      const qty = Math.max(1, Number(item.quantity) || 1);
      const unitMrp = Number(variant.mrpPrice);
      const unitTp = Number(variant.tradePrice);
      const rawSelling = Number(variant.sellingPrice || variant.mrpPrice);

      const baseUnit = isWholesale ? unitTp : unitMrp;
      baselineSubtotal += baseUnit * qty;

      // Individual Dominance:
      const hasItemIndividualPromo = !isWholesale && unitMrp > 0 && rawSelling < unitMrp;
      let effectiveUnitSelling = baseUnit;

      if (isWholesale) {
        effectiveUnitSelling = unitTp;
      } else if (hasItemIndividualPromo) {
        hasIndividualDiscount = true;
        effectiveUnitSelling = rawSelling;
        individualDiscountSum += (unitMrp - rawSelling) * qty;
      } else if (universalRate > 0) {
        effectiveUnitSelling = Math.round(unitMrp * (1 - universalRate));
        universalDiscountSum += (unitMrp - effectiveUnitSelling) * qty;
      } else {
        effectiveUnitSelling = unitMrp;
      }

      const lineTotal = effectiveUnitSelling * qty;
      actualItemsPayable += lineTotal;

      orderItemData.push({
        productId: variant.productId,
        variantId: variant.id,
        nameEn: variant.product.nameEn,
        nameBn: variant.product.nameBn,
        packSize: variant.packSize,
        sku: variant.sku,
        priceTierApplied: isWholesale ? BuyerTier.WHOLESALE : BuyerTier.RETAIL,
        unitTradePrice: new Prisma.Decimal(unitTp),
        unitMrpPrice: new Prisma.Decimal(unitMrp),
        unitSellingPrice: new Prisma.Decimal(effectiveUnitSelling),
        quantity: qty,
        lineTotal: new Prisma.Decimal(lineTotal),
      });
    }

    if (orderItemData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'কার্টের কোনো বৈধ পণ্য পাওয়া যায়নি' },
        { status: 400 }
      );
    }

    // 4. Check for Returning Customer Profile & Custom Discounts
    const existingProfile = await prisma.customerProfile.findUnique({
      where: { phone: cleanPhone },
    });

    let discountAmount = 0;
    let appliedDiscountSource: DiscountSource | null = null;
    let appliedDiscountLabel: string | null = null;

    if (
      existingProfile &&
      existingProfile.hasCustomDiscount &&
      Number(existingProfile.discountValue) > 0 &&
      baselineSubtotal >= Number(existingProfile.minOrderForDiscount || 0)
    ) {
      // Priority 1: Customer Profile Custom Discount
      const discountVal = Number(existingProfile.discountValue);
      if (existingProfile.discountType === 'PERCENTAGE') {
        discountAmount = Math.round((baselineSubtotal * discountVal) / 100);
      } else {
        discountAmount = Math.min(baselineSubtotal, discountVal);
      }
      appliedDiscountSource = 'CLIENT_CUSTOM';
      appliedDiscountLabel = `${existingProfile.businessOrFarmName || existingProfile.name} VIP Discount (${discountVal}%)`;
    } else if (!isWholesale) {
      discountAmount = baselineSubtotal - actualItemsPayable;

      if (hasIndividualDiscount && universalDiscountSum > 0) {
        appliedDiscountSource = 'INDIVIDUAL_PRODUCT';
        appliedDiscountLabel = `Product Promo + ${universalPercent}% Universal Discount`;
      } else if (hasIndividualDiscount) {
        appliedDiscountSource = 'INDIVIDUAL_PRODUCT';
        appliedDiscountLabel = 'Product Promotional Discount';
      } else if (universalDiscountSum > 0) {
        appliedDiscountSource = 'GENERAL_STOREWIDE';
        appliedDiscountLabel = `Website ${universalPercent}% Universal Discount`;
      }
    }

    // 5. Calculate Shipping Fee based on District
    const isDhaka = district.trim().toLowerCase().includes('dhaka') || district.trim() === 'ঢাকা';
    const shippingFee = isDhaka ? 70 : 130;

    // 6. Compute Grand Total & Due Amount
    const grandTotal = Math.max(0, baselineSubtotal - discountAmount + shippingFee);
    const dueAmount = grandTotal; // Cash On Delivery collects full amount

    // 7. Execute Atomic DB Transaction
    const order = await prisma.$transaction(async (tx) => {
      // Generate Guaranteed Sequential Unique Order Number (e.g. AV-2610-0013)
      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const prefix = `AV-${yy}${mm}-`;

      const latestOrder = await tx.order.findFirst({
        where: { orderNumber: { startsWith: prefix } },
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true },
      });

      let nextSeq = 1;
      if (latestOrder) {
        const lastNum = parseInt(latestOrder.orderNumber.replace(prefix, ''), 10);
        if (!isNaN(lastNum)) {
          nextSeq = lastNum + 1;
        }
      }

      let orderNumber = `${prefix}${String(nextSeq).padStart(4, '0')}`;
      while (await tx.order.findUnique({ where: { orderNumber } })) {
        nextSeq++;
        orderNumber = `${prefix}${String(nextSeq).padStart(4, '0')}`;
      }

      // Upsert CustomerProfile
      const profile = await tx.customerProfile.upsert({
        where: { phone: cleanPhone },
        update: {
          name: customerName.trim(),
          district: district.trim(),
          upazila: upazila.trim(),
          address: address.trim(),
          totalOrdersCount: { increment: 1 },
        },
        create: {
          phone: cleanPhone,
          name: customerName.trim(),
          district: district.trim(),
          upazila: upazila.trim(),
          address: address.trim(),
          totalOrdersCount: 1,
        },
      });

      // Create Order & Items
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          orderType: isWholesale ? BuyerTier.WHOLESALE : BuyerTier.RETAIL,
          customerProfileId: profile.id,
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          customerAltPhone: (customerAltPhone || '').trim() || null,
          district: district.trim(),
          upazila: upazila.trim(),
          address: address.trim(),
          orderNote: (orderNote || '').trim() || null,

          subtotal: new Prisma.Decimal(baselineSubtotal),
          discountAmount: new Prisma.Decimal(discountAmount),
          appliedDiscountSource,
          appliedDiscountLabel,
          shippingFee: new Prisma.Decimal(shippingFee),
          grandTotal: new Prisma.Decimal(grandTotal),
          paidAmount: new Prisma.Decimal(0),
          dueAmount: new Prisma.Decimal(dueAmount),
          codCollectableAmount: new Prisma.Decimal(dueAmount),

          paymentMethod: 'COD',
          paymentStatus: 'UNPAID',
          orderStatus: 'PENDING',
          agreedToPolicies: true,

          items: {
            create: orderItemData,
          },
        },
        select: {
          id: true,
          orderNumber: true,
          grandTotal: true,
          customerName: true,
          customerPhone: true,
        },
      });

      return createdOrder;
    });

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      orderNumber: order.orderNumber,
      orderId: order.id,
    });
  } catch (error: any) {
    console.error('Error placing order:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'অর্ডার সাবমিট করতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।',
      },
      { status: 500 }
    );
  }
}
