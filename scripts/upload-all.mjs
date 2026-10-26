import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// 1. Load Environment Variables from .env
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// 2. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const prisma = new PrismaClient();
const RAW_DIR = path.join(process.cwd(), 'public', 'product-images-raw');

async function main() {
  console.log('=====================================================');
  console.log('🚀 Starting Cloudinary Product Images Upload & Sync');
  console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log('=====================================================\n');

  if (!fs.existsSync(RAW_DIR)) {
    console.error(`❌ Source directory not found: ${RAW_DIR}`);
    process.exit(1);
  }

  // Fetch all existing products from database
  const dbProducts = await prisma.product.findMany();
  console.log(`📦 Found ${dbProducts.length} products in database.\n`);

  const entries = fs.readdirSync(RAW_DIR, { withFileTypes: true });
  const folders = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  const uploadResults = [];

  // Optional: Handle _logo folder
  const logoFolder = folders.find((f) => f === '_logo');
  if (logoFolder) {
    const logoDir = path.join(RAW_DIR, logoFolder);
    const logoFiles = fs.readdirSync(logoDir).filter((f) => /\.(png|jpe?g|webp|svg)$/i.test(f));
    for (const file of logoFiles) {
      const filePath = path.join(logoDir, file);
      console.log(`Uploading brand logo: ${file}...`);
      try {
        const res = await cloudinary.uploader.upload(filePath, {
          folder: 'research-agro-vet/brand',
          public_id: path.parse(file).name,
          overwrite: true,
          resource_type: 'image',
        });
        console.log(`✅ Logo uploaded: ${res.secure_url}\n`);
      } catch (err) {
        console.error(`❌ Failed to upload logo: ${err.message}`);
      }
    }
  }

  // Process product folders
  for (const folder of folders) {
    if (folder.startsWith('_')) continue; // Skip non-product folders like _logo

    const numMatch = folder.match(/^(\d+)/);
    const legacyId = numMatch ? parseInt(numMatch[1], 10) : null;

    // Find product in DB
    const product = dbProducts.find(
      (p) => p.legacyCatalogId === legacyId || p.slug.startsWith(folder.replace(/^\d+-/, ''))
    );

    if (!product) {
      console.warn(`⚠️ No DB product match found for folder: "${folder}" (legacy ID: ${legacyId})`);
      continue;
    }

    const folderPath = path.join(RAW_DIR, folder);
    const files = fs
      .readdirSync(folderPath)
      .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
      .sort();

    if (files.length === 0) {
      console.warn(`⚠️ No images in folder: "${folder}"`);
      continue;
    }

    console.log(`▶ [${legacyId || '?'}] ${product.nameEn} (${folder}) - ${files.length} image(s)...`);

    const uploadedUrls = [];

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const publicId = path.parse(file).name;

      try {
        const uploadRes = await cloudinary.uploader.upload(filePath, {
          folder: `research-agro-vet/products/${product.slug}`,
          public_id: publicId,
          overwrite: true,
          resource_type: 'image',
        });
        uploadedUrls.push(uploadRes.secure_url);
        console.log(`   + Uploaded: ${file} -> ${uploadRes.secure_url}`);
      } catch (uploadErr) {
        console.error(`   ❌ Failed to upload ${file}: ${uploadErr.message}`);
      }
    }

    if (uploadedUrls.length > 0) {
      const primaryThumbnail = uploadedUrls[0];
      await prisma.product.update({
        where: { id: product.id },
        data: {
          thumbnail: primaryThumbnail,
          images: uploadedUrls,
        },
      });

      console.log(`   ✨ Updated DB for "${product.nameEn}": thumbnail + ${uploadedUrls.length} images.\n`);

      uploadResults.push({
        legacyCatalogId: product.legacyCatalogId,
        slug: product.slug,
        nameEn: product.nameEn,
        thumbnail: primaryThumbnail,
        images: uploadedUrls,
      });
    }
  }

  // Write summary map to json
  const outPath = path.join(process.cwd(), 'prisma', 'cloudinary-products-map.json');
  fs.writeFileSync(outPath, JSON.stringify(uploadResults, null, 2), 'utf-8');
  console.log(`🎉 Complete! Successfully synced ${uploadResults.length} products to Cloudinary & DB.`);
  console.log(`Saved audit map to: ${outPath}`);
}

main()
  .catch((err) => {
    console.error('Fatal error during upload:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
