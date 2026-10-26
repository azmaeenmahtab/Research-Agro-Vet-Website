import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Load .env
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

console.log('Testing Cloudinary config...');
console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key present:', !!process.env.CLOUDINARY_API_KEY);
console.log('API Secret present:', !!process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function test() {
  try {
    const ping = await cloudinary.api.ping();
    console.log('Cloudinary ping response:', ping);
  } catch (err) {
    console.error('Cloudinary ping error:', err);
  }
}

test();
