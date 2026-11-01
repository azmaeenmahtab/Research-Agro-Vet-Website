import { PrismaClient } from '@prisma/client';
import { generateStandardSku } from '../src/lib/sku-generator';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting 3-Digit Serial SKU Standardization Migration...');

  // 1. Fetch all products ordered by legacyCatalogId or createdAt
  const products = await prisma.product.findMany({
    orderBy: [
      { legacyCatalogId: 'asc' },
      { createdAt: 'asc' },
    ],
    include: {
      variants: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  console.log(`Found ${products.length} products to evaluate.`);

  // Find max existing legacyCatalogId
  let maxId = 0;
  for (const p of products) {
    if (p.legacyCatalogId && p.legacyCatalogId > maxId) {
      maxId = p.legacyCatalogId;
    }
  }

  // Ensure all products have a valid sequential legacyCatalogId
  for (const product of products) {
    if (!product.legacyCatalogId) {
      maxId += 1;
      await prisma.product.update({
        where: { id: product.id },
        data: { legacyCatalogId: maxId },
      });
      product.legacyCatalogId = maxId;
      console.log(`  Assigned legacyCatalogId=${maxId} to [${product.nameEn}]`);
    }
  }

  const usedSkus = new Set<string>();
  let updatedCount = 0;

  for (const product of products) {
    for (const variant of product.variants) {
      const baseSku = generateStandardSku(
        product.legacyCatalogId,
        product.formFactor,
        variant.packSize
      );

      let finalSku = baseSku;
      let counter = 2;

      while (usedSkus.has(finalSku)) {
        finalSku = `${baseSku}-${counter++}`;
      }
      usedSkus.add(finalSku);

      if (variant.sku !== finalSku) {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { sku: finalSku },
        });
        console.log(
          `  [#${String(product.legacyCatalogId).padStart(3, '0')} - ${product.nameEn}] (${variant.packSize}): ${variant.sku} ➡️ ${finalSku}`
        );
        updatedCount++;
      } else {
        console.log(`  [#${String(product.legacyCatalogId).padStart(3, '0')} - ${product.nameEn}] (${variant.packSize}): Already ${finalSku}`);
      }
    }
  }

  console.log(`\n✅ 3-Digit SKU Migration Completed: ${updatedCount} variants standardized to RAV-[3-digit-serial]-[FORM]-[PACK] format.`);
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
