import { PrismaClient, ProductFormFactor, ProductStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function parsePrice(priceStr: string | null | undefined): number {
  if (!priceStr) return 0;
  const match = priceStr.replace(/,/g, '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

async function main() {
  console.log('Starting Agro-Vet Database Seed...');

  // 1. Seed Core Categories
  const categories = [
    {
      slug: 'digestive-appetite-care',
      nameEn: 'Digestive & Appetite Care',
      nameBn: 'ক্ষুধা, হজম ও পেট ফাঁপা',
      sortOrder: 1,
    },
    {
      slug: 'calcium-milk-bone',
      nameEn: 'Calcium & Milk Production',
      nameBn: 'ক্যালসিয়াম ও দুধ বৃদ্ধিকারক',
      sortOrder: 2,
    },
    {
      slug: 'vitamins-growth-promoters',
      nameEn: 'Vitamins & Growth Promoters',
      nameBn: 'ভিটামিন, জিংক ও দৈহিক বৃদ্ধি',
      sortOrder: 3,
    },
    {
      slug: 'liver-tonic-digestive',
      nameEn: 'Liver Tonic & Toxin Binder',
      nameBn: 'লিভার টনিক ও টক্সিন বাইন্ডার',
      sortOrder: 4,
    },
    {
      slug: 'reproductive-uterine-care',
      nameEn: 'Reproductive & Uterine Care',
      nameBn: 'প্রজনন ও জরায়ু সুরক্ষা',
      sortOrder: 5,
    },
    {
      slug: 'electrolytes-diarrhea-wound',
      nameEn: 'Electrolytes, Diarrhea & Wound Care',
      nameBn: 'স্যালাইন, ডায়রিয়া ও ক্ষত নিরাময়',
      sortOrder: 6,
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log('Categories seeded.');

  // 2. Seed Default SiteSettings
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'Research Agro Vet',
      storeTagline: 'Licensed Veterinary Medicine & Nutritional Supplements Dealer',
      supportPhone: '01700000000',
      whatsappNumber: '8801700000000',
      supportEmail: 'contact@researchagrovet.com',
      insideDistrictFee: 70,
      outsideDistrictFee: 130,
    },
  });
  console.log('Default Site Settings seeded.');

  // 3. Load & Seed Merged Products
  const seedProductsPath = path.join(__dirname, 'seed-products.json');
  if (fs.existsSync(seedProductsPath)) {
    const rawData = fs.readFileSync(seedProductsPath, 'utf8');
    const productsData = JSON.parse(rawData);

    for (const item of productsData) {
      const baseSlug = slugify(item.nameEn || `product-${item.legacyCatalogId}`);
      const slug = baseSlug || `product-${item.legacyCatalogId}`;

      const createdProduct = await prisma.product.upsert({
        where: { legacyCatalogId: item.legacyCatalogId },
        update: {
          nameEn: item.nameEn,
          nameBn: item.nameBn || null,
          dlsLicenseNo: item.dlsLicenseNo || null,
          composition: item.composition || null,
          indication: item.indication || null,
          dosageAndAdministration: item.dosageAndAdministration || null,
          status: ProductStatus.ACTIVE,
        },
        create: {
          legacyCatalogId: item.legacyCatalogId,
          nameEn: item.nameEn,
          nameBn: item.nameBn || null,
          slug: `${slug}-${item.legacyCatalogId}`,
          formFactor: ProductFormFactor.POWDER,
          speciesTags: ['CATTLE_BUFFALO', 'POULTRY', 'GOAT_SHEEP'],
          dlsLicenseNo: item.dlsLicenseNo || null,
          composition: item.composition || null,
          indication: item.indication || null,
          dosageAndAdministration: item.dosageAndAdministration || null,
          status: ProductStatus.ACTIVE,
        },
      });

      // Seed Variants
      if (Array.isArray(item.pricing)) {
        for (let idx = 0; idx < item.pricing.length; idx++) {
          const priceObj = item.pricing[idx];
          const packSize = priceObj.size_or_weight || 'Standard';
          const tp = parsePrice(priceObj.trade_price_tp);
          const mrp = parsePrice(priceObj.maximum_retail_price_mrp);
          const sku = `AV-${item.legacyCatalogId}-${idx + 1}`;

          await prisma.productVariant.upsert({
            where: { sku },
            update: {
              packSize,
              tradePrice: tp,
              mrpPrice: mrp,
              sellingPrice: mrp,
            },
            create: {
              productId: createdProduct.id,
              sku,
              packSize,
              tradePrice: tp,
              mrpPrice: mrp,
              sellingPrice: mrp,
              stockQuantity: 100,
              isDefault: idx === 0,
            },
          });
        }
      }
    }
    console.log(`Seeded ${productsData.length} products with variants.`);
  }

  console.log('Agro-Vet Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error in seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
