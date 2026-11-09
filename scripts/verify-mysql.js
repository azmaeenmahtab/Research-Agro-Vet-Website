const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const [products, variants, categories, orders, users] = await Promise.all([
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.user.count(),
  ]);

  const sampleProduct = await prisma.product.findFirst({
    include: { variants: true, category: true },
  });

  const sampleOrder = await prisma.order.findFirst({
    include: { items: true },
  });

  console.log('--- MySQL Live Database Verification ---');
  console.log(`Total Products: ${products}`);
  console.log(`Total Product Variants: ${variants}`);
  console.log(`Total Categories: ${categories}`);
  console.log(`Total Orders: ${orders}`);
  console.log(`Total Better Auth Users: ${users}`);
  console.log('Sample Product:', sampleProduct?.nameEn, `(Variants: ${sampleProduct?.variants?.length})`);
  console.log('Sample Order:', sampleOrder?.orderNumber, `(Items: ${sampleOrder?.items?.length})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

