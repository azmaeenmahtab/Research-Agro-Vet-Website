import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sample orders for Admin Tele-Confirmation Dashboard...');

  const products = await prisma.product.findMany({
    include: { variants: true },
    take: 5,
  });

  if (products.length === 0) {
    console.log('No products found in database to associate order items.');
    return;
  }

  const existingOrders = await prisma.order.count();
  if (existingOrders > 0) {
    console.log(`Already have ${existingOrders} orders in database. Skipping seed.`);
    return;
  }

  const p1 = products[0];
  const v1 = p1.variants[0];

  const p2 = products[1] || products[0];
  const v2 = p2.variants[0] || v1;

  const p3 = products[2] || products[0];
  const v3 = p3.variants[0] || v1;

  // Order 1: Recent Pending Order (target for drawer)
  await prisma.order.create({
    data: {
      orderNumber: 'AV-2610-0012',
      customerName: 'মোঃ রহিম উদ্দিন',
      customerPhone: '01711892345',
      district: 'ঢাকা',
      upazila: 'সাভার',
      address: 'দিলখোলা ডেইরি, ফুলবাড়িয়া বাসস্ট্যান্ড সংলগ্ন, সাভার',
      orderNote: 'জরুরি ডেলিভারি লাগবে, গাভীর দুধ কমে গেছে।',
      subtotal: 1120,
      discountAmount: 90,
      appliedDiscountLabel: 'Website 5% Universal Discount',
      appliedDiscountSource: 'GENERAL_STOREWIDE',
      shippingFee: 130,
      grandTotal: 1160,
      paidAmount: 0,
      dueAmount: 1160,
      paymentMethod: 'COD',
      paymentStatus: 'UNPAID',
      orderStatus: 'PENDING',
      adminNotes: 'খামারিকে ৩ দিন পর গাভীর দুধের পরিমাপ ও ক্যালসিয়াম রেসপন্স লক্ষ্য করার পরামর্শ দেওয়া হয়েছে। সকালের ফিডের সাথে ৫০ মিলি করে প্রয়োগ করবেন।',
      items: {
        create: [
          {
            productId: p1.id,
            variantId: v1.id,
            nameEn: p1.nameEn,
            nameBn: p1.nameBn,
            packSize: v1.packSize,
            sku: v1.sku,
            unitTradePrice: v1.tradePrice,
            unitMrpPrice: v1.mrpPrice,
            unitSellingPrice: v1.sellingPrice,
            quantity: 2,
            lineTotal: Number(v1.sellingPrice) * 2,
          },
          {
            productId: p2.id,
            variantId: v2.id,
            nameEn: p2.nameEn,
            nameBn: p2.nameBn,
            packSize: v2.packSize,
            sku: v2.sku,
            unitTradePrice: v2.tradePrice,
            unitMrpPrice: v2.mrpPrice,
            unitSellingPrice: v2.sellingPrice,
            quantity: 1,
            lineTotal: Number(v2.sellingPrice) * 1,
          },
        ],
      },
    },
  });

  // Order 2: Confirmed Order (Paid)
  await prisma.order.create({
    data: {
      orderNumber: 'AV-2610-0011',
      customerName: 'ডাঃ শাহাদাত হোসেন',
      customerPhone: '01923481239',
      district: 'গাজীপুর',
      upazila: 'শ্রীপুর',
      address: 'মডেল পোল্ট্রি খামার, বরমী বাজার, শ্রীপুর',
      orderNote: 'কোল্ড চেইনে পাঠাবেন।',
      subtotal: 3450,
      discountAmount: 0,
      shippingFee: 150,
      grandTotal: 3600,
      paidAmount: 3600,
      dueAmount: 0,
      paymentMethod: 'PARTIAL_ADVANCE',
      paymentStatus: 'PAID',
      orderStatus: 'CONFIRMED',
      courierProvider: 'PATHAO',
      adminNotes: 'বিকাশ মার্চেন্টে সম্পূর্ণ পেমেন্ট রিসিভ করা হয়েছে (TrxID: BJI982KL1M)।',
      items: {
        create: [
          {
            productId: p1.id,
            variantId: v1.id,
            nameEn: p1.nameEn,
            nameBn: p1.nameBn,
            packSize: v1.packSize,
            sku: v1.sku,
            unitTradePrice: v1.tradePrice,
            unitMrpPrice: v1.mrpPrice,
            unitSellingPrice: v1.sellingPrice,
            quantity: 5,
            lineTotal: Number(v1.sellingPrice) * 5,
          },
        ],
      },
    },
  });

  // Order 3: Shipped Order (Partial Payment)
  await prisma.order.create({
    data: {
      orderNumber: 'AV-2610-0010',
      customerName: 'আনোয়ার জামান',
      customerPhone: '01844120955',
      district: 'সিরাজগঞ্জ',
      upazila: 'বেলকুচি',
      address: 'সোনালী এগ্রো, মুকুন্দগাঁতী, বেলকুচি',
      subtotal: 970,
      discountAmount: 150,
      appliedDiscountLabel: 'Manager Special Phone Rebate',
      appliedDiscountSource: 'ADMIN_MANUAL',
      shippingFee: 130,
      grandTotal: 950,
      paidAmount: 300,
      dueAmount: 650,
      codCollectableAmount: 650,
      paymentMethod: 'PARTIAL_ADVANCE',
      paymentStatus: 'PARTIAL',
      orderStatus: 'SHIPPED',
      courierProvider: 'STEADFAST',
      consignmentId: 'SF-8829104',
      trackingCode: 'STEADFAST-8829104',
      adminNotes: 'স্টেডফাস্ট কুরিয়ারে বুকিং সম্পন্ন। কন্ডিশন ৳৬৫০।',
      items: {
        create: [
          {
            productId: p3.id,
            variantId: v3.id,
            nameEn: p3.nameEn,
            nameBn: p3.nameBn,
            packSize: v3.packSize,
            sku: v3.sku,
            unitTradePrice: v3.tradePrice,
            unitMrpPrice: v3.mrpPrice,
            unitSellingPrice: v3.sellingPrice,
            quantity: 2,
            lineTotal: Number(v3.sellingPrice) * 2,
          },
        ],
      },
    },
  });

  // Order 4: Delivered Order
  await prisma.order.create({
    data: {
      orderNumber: 'AV-2610-0009',
      customerName: 'মোঃ রফিকুল ইসলাম',
      customerPhone: '01712499182',
      district: 'পাবনা',
      upazila: 'ঈশ্বরদী',
      address: 'গ্রিন ভ্যালি ডেইরি, সাহাপুর, ঈশ্বরদী',
      subtotal: 1840,
      discountAmount: 100,
      shippingFee: 130,
      grandTotal: 1870,
      paidAmount: 1870,
      dueAmount: 0,
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      courierProvider: 'STEADFAST',
      consignmentId: 'SF-7712390',
      deliveredAt: new Date(),
      items: {
        create: [
          {
            productId: p2.id,
            variantId: v2.id,
            nameEn: p2.nameEn,
            nameBn: p2.nameBn,
            packSize: v2.packSize,
            sku: v2.sku,
            unitTradePrice: v2.tradePrice,
            unitMrpPrice: v2.mrpPrice,
            unitSellingPrice: v2.sellingPrice,
            quantity: 3,
            lineTotal: Number(v2.sellingPrice) * 3,
          },
        ],
      },
    },
  });

  // Order 5: Another New Pending Order
  await prisma.order.create({
    data: {
      orderNumber: 'AV-2610-0008',
      customerName: 'আলহাজ্ব শামসুল হক',
      customerPhone: '01819340012',
      district: 'ঢাকা',
      upazila: 'কেরানীগঞ্জ',
      address: 'হক ডেইরি ফার্ম, রোহিতপুর, কেরানীগঞ্জ',
      orderNote: 'বিকেলে ডেলিভারি দিলে ভালো হয়।',
      subtotal: 720,
      discountAmount: 0,
      shippingFee: 80,
      grandTotal: 800,
      paidAmount: 0,
      dueAmount: 800,
      paymentMethod: 'COD',
      paymentStatus: 'UNPAID',
      orderStatus: 'PENDING',
      items: {
        create: [
          {
            productId: p1.id,
            variantId: v1.id,
            nameEn: p1.nameEn,
            nameBn: p1.nameBn,
            packSize: v1.packSize,
            sku: v1.sku,
            unitTradePrice: v1.tradePrice,
            unitMrpPrice: v1.mrpPrice,
            unitSellingPrice: v1.sellingPrice,
            quantity: 2,
            lineTotal: Number(v1.sellingPrice) * 2,
          },
        ],
      },
    },
  });

  console.log('Seeded 5 sample orders successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

