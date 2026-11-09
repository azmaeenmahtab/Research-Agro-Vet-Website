const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Preparing cPanel Deployment Package...\n');

const standaloneDir = path.join(__dirname, '..', '.next', 'standalone');
const staticSrc = path.join(__dirname, '..', '.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
const publicSrc = path.join(__dirname, '..', 'public');
const publicDest = path.join(standaloneDir, 'public');
const deployDir = path.join(__dirname, '..', 'cpanel-deployment');

if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir, { recursive: true });
}

// 1. Copy .next/static into .next/standalone/.next/static
console.log('1️⃣ Copying .next/static to standalone build...');
if (fs.existsSync(staticSrc)) {
  fs.cpSync(staticSrc, staticDest, { recursive: true });
  console.log('   ✅ Static assets copied.');
} else {
  console.warn('   ⚠️ .next/static not found. Run npm run build first.');
}

// 2. Copy public into .next/standalone/public
console.log('2️⃣ Copying public directory to standalone build...');
if (fs.existsSync(publicSrc)) {
  fs.cpSync(publicSrc, publicDest, { recursive: true });
  console.log('   ✅ Public files copied.');
}

// 3. Create .env.production template in cpanel-deployment
const envTemplate = `# cPanel Production Environment Configuration
NODE_ENV=production
PORT=3000

# Replace with your cPanel MySQL Database credentials:
# Format: mysql://<cpanel_user>_<db_user>:<password>@localhost:3306/<cpanel_user>_<database_name>
DATABASE_URL="mysql://cpaneluser_dbuser:your_password@localhost:3306/cpaneluser_researchagrovetdb"

# Better Auth Configuration
BETTER_AUTH_SECRET="ems2pYNcQrJm1AUoEfqNcUfu1WBCgeav"
BETTER_AUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Optional: If running Express backend separately on api.yourdomain.com
# NEXT_PUBLIC_API_URL="https://api.yourdomain.com"

# Cloudinary CDN Credentials
CLOUDINARY_CLOUD_NAME=hql5pdgh
CLOUDINARY_API_KEY=977593325364362
CLOUDINARY_API_SECRET=cAWcUJ2XPRxBeSyKde9Qv1zQbU4
`;

fs.writeFileSync(path.join(deployDir, '.env.production.sample'), envTemplate);
console.log('3️⃣ Created cpanel-deployment/.env.production.sample');

// 4. Create a root entrypoint server.js for cPanel Passenger
const passengerServer = `// cPanel Phusion Passenger Startup Entrypoint
const path = require('path');
process.chdir(__dirname);

// Delegate to Next.js standalone server
require('./server.js');
`;
fs.writeFileSync(path.join(standaloneDir, 'passenger_server.js'), passengerServer);
console.log('4️⃣ Created passenger_server.js in standalone directory');

console.log('\n🎉 Standalone package prepared successfully!');
console.log(`📁 Standalone files ready in: ${standaloneDir}`);

