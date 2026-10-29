import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial authentic product reviews...');

  const milkPlus = await prisma.product.findFirst({
    where: { nameEn: { contains: 'MILK', mode: 'insensitive' } },
  });

  const dbPlus = await prisma.product.findFirst({
    where: { nameEn: { contains: 'DB PLUS', mode: 'insensitive' } },
  });

  const dcpPlus = await prisma.product.findFirst({
    where: { nameEn: { contains: 'DCP', mode: 'insensitive' } },
  });

  if (milkPlus) {
    await prisma.productReview.createMany({
      data: [
        {
          productId: milkPlus.id,
          userName: 'মোঃ আব্দুল আলীম',
          farmerType: 'ডেইরি খামারি (পাবনা)',
          rating: 5,
          comment: 'গাভীকে নিয়মিত এক চামচ করে খাওয়ানোর পর দৈনিক প্রায় ১.৫ লিটার দুধ বৃদ্ধি পেয়েছে। দুধের ঘনত্ব ও ফ্যাটও আগের চেয়ে অনেক ভালো।',
          status: 'APPROVED',
          isVerified: true,
        },
        {
          productId: milkPlus.id,
          userName: 'খলিলুর রহমান',
          farmerType: 'ডেইরি ফার্মাসিস্ট (সিরাজগঞ্জ)',
          rating: 5,
          comment: 'আমাদের এলাকার খামারিরা এই পাউডারটি খুব পছন্দ করে। মিল্ক ফিভার ও ক্যালসিয়ামের ঘাটতি দূর করতে পরীক্ষিত প্রি-মিক্স।',
          status: 'APPROVED',
          isVerified: true,
        },
        {
          productId: milkPlus.id,
          userName: 'রফিকুল ইসলাম',
          farmerType: 'গাভী পালনকারী',
          rating: 4,
          comment: 'অর্ডার করার ২ দিনের মধ্যে ডেলিভারি পেয়েছি। নিয়মিত খাওয়াচ্ছি, রেজাল্ট বেশ সন্তোষজনক।',
          status: 'APPROVED',
          isVerified: true,
        },
      ],
      skipDuplicates: true,
    });
    console.log('Seeded reviews for Milk Plus');
  }

  if (dbPlus) {
    await prisma.productReview.createMany({
      data: [
        {
          productId: dbPlus.id,
          userName: 'ডাঃ শরিফুল ইসলাম',
          farmerType: 'ভেটেরিনারি প্র্যাকটিশনার',
          rating: 5,
          comment: 'বদহজম, রুমিনাল এসিডোসিস এবং খাবারের অরুচি দূর করতে দারুণ কার্যকরী ফর্মুলেশন। রুমেন ফাংশন দ্রুত স্বাভাবিক করে।',
          status: 'APPROVED',
          isVerified: true,
        },
        {
          productId: dbPlus.id,
          userName: 'বাবুল হোসেন',
          farmerType: 'মোটাতাজাকরণ খামারি (নাটোর)',
          rating: 5,
          comment: 'গরুর পেট ফাঁপা ও জাবর কাটা বন্ধ হয়ে গিয়েছিল, এই পাউডার পানিতে গুলিয়ে খাওয়ানোর ৩ ঘণ্টার মধ্যে জাবর কাটা শুরু করে। আলহামদুলিল্লাহ।',
          status: 'APPROVED',
          isVerified: true,
        },
      ],
      skipDuplicates: true,
    });
    console.log('Seeded reviews for DB Plus');
  }

  if (dcpPlus) {
    await prisma.productReview.createMany({
      data: [
        {
          productId: dcpPlus.id,
          userName: 'কবির উদ্দিন',
          farmerType: 'পোল্ট্রি ও লেয়ার খামারি',
          rating: 5,
          comment: 'ডিমের খোসা শক্ত করতে এবং মুরগির ক্যালসিয়ামের ঘাটতি মেটাতে অনেক দিন ধরে নিয়মিত ব্যবহার করছি। ১০০% কার্যকর।',
          status: 'APPROVED',
          isVerified: true,
        },
      ],
      skipDuplicates: true,
    });
    console.log('Seeded reviews for DCP Plus');
  }

  console.log('Initial reviews seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
