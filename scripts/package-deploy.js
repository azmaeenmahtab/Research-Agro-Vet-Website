const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Packaging Research Agro Vet for cPanel Production...\n');

const rootDir = path.join(__dirname, '..');
const deployDir = path.join(rootDir, 'cpanel-deployment');
const stageDir = path.join(deployDir, 'stage-production');
const deployZip = path.join(deployDir, 'nextjs-cpanel-production.zip');

if (fs.existsSync(stageDir)) {
  fs.rmSync(stageDir, { recursive: true, force: true });
}
fs.mkdirSync(stageDir, { recursive: true });

// 1. Copy production .next folder
console.log('1️⃣ Copying production .next build assets...');
const nextDest = path.join(stageDir, '.next');
fs.mkdirSync(nextDest, { recursive: true });

// Copy server, static
fs.cpSync(path.join(rootDir, '.next', 'server'), path.join(nextDest, 'server'), { recursive: true });
fs.cpSync(path.join(rootDir, '.next', 'static'), path.join(nextDest, 'static'), { recursive: true });

// Copy root manifest files
const manifestFiles = [
  'BUILD_ID',
  'app-path-routes-manifest.json',
  'build-manifest.json',
  'export-marker.json',
  'fallback-build-manifest.json',
  'images-manifest.json',
  'next-minimal-server.js.nft.json',
  'next-server.js.nft.json',
  'package.json',
  'prerender-manifest.json',
  'required-server-files.js',
  'required-server-files.json',
  'routes-manifest.json',
];

for (const file of manifestFiles) {
  const p = path.join(rootDir, '.next', file);
  if (fs.existsSync(p)) {
    fs.copyFileSync(p, path.join(nextDest, file));
  }
}

// 2. Dereference and copy Turbopack Prisma Client (replacing Windows Junction)
console.log('2️⃣ Packaging standalone Prisma Client for Linux...');
const nextNodeModules = path.join(nextDest, 'node_modules');
const nextPrismaDir = path.join(nextNodeModules, '@prisma');
fs.mkdirSync(nextPrismaDir, { recursive: true });

// Find the junction name if present (e.g. client-2c3a283f134fdcb6)
let clientFolderName = 'client-2c3a283f134fdcb6';
const srcPrismaNext = path.join(rootDir, '.next', 'node_modules', '@prisma');
if (fs.existsSync(srcPrismaNext)) {
  const entries = fs.readdirSync(srcPrismaNext);
  if (entries.length > 0) {
    clientFolderName = entries[0];
  }
}
console.log(`   Discovered Prisma client alias: ${clientFolderName}`);

// Target folder for the client
const targetClientDir = path.join(nextPrismaDir, clientFolderName);
fs.mkdirSync(targetClientDir, { recursive: true });

// Copy real files from node_modules/@prisma/client into targetClientDir
fs.cpSync(path.join(rootDir, 'node_modules', '@prisma', 'client'), targetClientDir, { recursive: true });

// Helper to copy only Linux query engines and schema (exclude huge Windows .dll.tmp files)
function copyLinuxPrisma(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const files = fs.readdirSync(src);
  for (const f of files) {
    if (f.endsWith('.tmp') || f.includes('.tmp') || f.endsWith('.dll.node')) {
      continue; // Skip Windows DLLs and crash temp files
    }
    const s = path.join(src, f);
    const d = path.join(dest, f);
    if (fs.statSync(s).isDirectory()) {
      fs.cpSync(s, d, { recursive: true });
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

// Copy .prisma/client (with Linux engines) into both locations
const nextDotPrisma = path.join(nextNodeModules, '.prisma', 'client');
copyLinuxPrisma(path.join(rootDir, 'node_modules', '.prisma', 'client'), nextDotPrisma);

const internalDotPrisma = path.join(targetClientDir, 'node_modules', '.prisma', 'client');
copyLinuxPrisma(path.join(rootDir, 'node_modules', '.prisma', 'client'), internalDotPrisma);

console.log('   ✅ Prisma client and Linux query engines bundled physically (zero Windows junctions, zero bloat).');

// 3. Copy public folder
console.log('3️⃣ Copying public assets...');
fs.cpSync(path.join(rootDir, 'public'), path.join(stageDir, 'public'), { recursive: true });

// 4. Create production .env file
console.log('4️⃣ Writing production .env file...');
const productionEnv = `# Production Environment for Research Agro Vet (cPanel CloudLinux)
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Prevent Tokio thread explosion on CloudLinux CageFS (fixes PANIC: timer has gone away)
TOKIO_WORKER_THREADS=1
UV_THREADPOOL_SIZE=2

# Database Connection (MySQL on cPanel)
DATABASE_URL="mysql://researc2_dbadmin:%40Researchagrovet0123@localhost:3306/researc2_researchagrovet?connection_limit=3&pool_timeout=10"

# Authentication & Base URL
BETTER_AUTH_SECRET=bcdb14026294036499dd167fb2b616970797922eb8e3980ce7c5470ade434b4c
BETTER_AUTH_URL=https://researchagrovet.com
NEXT_PUBLIC_APP_URL=https://researchagrovet.com
TRUSTED_ORIGINS=https://researchagrovet.com,https://www.researchagrovet.com
NEXT_PUBLIC_API_URL=

# Cloudinary CDN
CLOUDINARY_CLOUD_NAME=hql5pdgh
CLOUDINARY_API_KEY=977593325364362
CLOUDINARY_API_SECRET=cAWcUJ2XPRxBeSyKde9Qv1zQbU4
`;
fs.writeFileSync(path.join(stageDir, '.env'), productionEnv);

// 5. Create production package.json (minimal, without devDependencies)
console.log('5️⃣ Writing minimal production package.json...');
const prodPackageJson = {
  name: 'research-agro-vet',
  version: '0.1.0',
  private: true,
  scripts: {
    start: 'node server.js',
  },
  dependencies: {
    '@heroui/calendar': '^2.2.32',
    '@heroui/react': '^3.2.7',
    '@heroui/theme': '^2.4.26',
    '@internationalized/date': '^3.12.4',
    '@prisma/client': '^6.19.3',
    'better-auth': '^1.7.14',
    cloudinary: '^2.11.0',
    clsx: '^2.1.1',
    'framer-motion': '^14.9.0',
    'lucide-react': '^1.61.0',
    next: '16.4.3',
    'next-auth': '^5.0.0-beta.32',
    react: '19.3.0',
    'react-dom': '19.3.0',
    'tailwind-merge': '^3.7.0',
    zod: '^4.6.7',
    zustand: '^5.0.16',
  },
};
fs.writeFileSync(path.join(stageDir, 'package.json'), JSON.stringify(prodPackageJson, null, 2));

// 6. Create robust production server.js
console.log('6️⃣ Writing production server.js...');
const prodServerJs = `// Production Server for cPanel / CloudLinux LiteSpeed
// 0. CloudLinux process & thread ceiling safeguards
// Tokio default queries host hardware (e.g. 32-64 cores) and attempts to spawn 64 threads,
// exceeding CloudLinux account process limit (nproc) and crashing with "PANIC: timer has gone away".
process.env.TOKIO_WORKER_THREADS = '1';
process.env.UV_THREADPOOL_SIZE = '2';

const http = require('http');
const { parse } = require('url');
const fs = require('fs');
const path = require('path');

// 1. Automatically load production .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile(envPath);
    } else {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\\n').forEach(line => {
        const match = line.match(/^\\s*([\\w.-]+)\\s*=\\s*(.*)?\\s*$/);
        if (match) {
          const key = match[1];
          let val = match[2] || '';
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
          process.env[key] = val;
        }
      });
    }
    console.log('✅ Loaded environment variables from .env');
  } catch (err) {
    console.warn('⚠️ Could not load .env file:', err.message);
  }
}

// 2. Set guaranteed production fallback variables
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'mysql://researc2_dbadmin:%40Researchagrovet0123@localhost:3306/researc2_researchagrovet?connection_limit=3&pool_timeout=10';
}
if (!process.env.BETTER_AUTH_SECRET) {
  process.env.BETTER_AUTH_SECRET = 'bcdb14026294036499dd167fb2b616970797922eb8e3980ce7c5470ade434b4c';
}
if (!process.env.BETTER_AUTH_URL) {
  process.env.BETTER_AUTH_URL = 'https://researchagrovet.com';
}
if (!process.env.NEXT_PUBLIC_APP_URL) {
  process.env.NEXT_PUBLIC_APP_URL = 'https://researchagrovet.com';
}
if (!process.env.TRUSTED_ORIGINS) {
  process.env.TRUSTED_ORIGINS = 'https://researchagrovet.com,https://www.researchagrovet.com';
}
process.env.TOKIO_WORKER_THREADS = '1';
process.env.UV_THREADPOOL_SIZE = '2';

// 3. Configure Prisma Query Engine Library path for CloudLinux / RHEL
function configurePrismaEngine() {
  const searchDirs = [
    path.join(__dirname, '.next', 'node_modules', '.prisma', 'client'),
  ];
  const atPrisma = path.join(__dirname, '.next', 'node_modules', '@prisma');
  if (fs.existsSync(atPrisma)) {
    try {
      const entries = fs.readdirSync(atPrisma);
      for (const entry of entries) {
        searchDirs.push(path.join(atPrisma, entry, 'node_modules', '.prisma', 'client'));
      }
    } catch (e) {}
  }

  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;
    const rhel1 = path.join(dir, 'libquery_engine-rhel-openssl-1.1.x.so.node');
    const rhel3 = path.join(dir, 'libquery_engine-rhel-openssl-3.0.x.so.node');
    const deb1 = path.join(dir, 'libquery_engine-debian-openssl-1.1.x.so.node');
    const deb3 = path.join(dir, 'libquery_engine-debian-openssl-3.0.x.so.node');

    if (fs.existsSync(rhel1)) {
      process.env.PRISMA_QUERY_ENGINE_LIBRARY = rhel1;
      console.log('✅ Pointed PRISMA_QUERY_ENGINE_LIBRARY to RHEL 1.1 engine:', rhel1);
      return;
    } else if (fs.existsSync(rhel3)) {
      process.env.PRISMA_QUERY_ENGINE_LIBRARY = rhel3;
      console.log('✅ Pointed PRISMA_QUERY_ENGINE_LIBRARY to RHEL 3.0 engine:', rhel3);
      return;
    } else if (fs.existsSync(deb1)) {
      process.env.PRISMA_QUERY_ENGINE_LIBRARY = deb1;
      console.log('✅ Pointed PRISMA_QUERY_ENGINE_LIBRARY to Debian 1.1 engine:', deb1);
      return;
    } else if (fs.existsSync(deb3)) {
      process.env.PRISMA_QUERY_ENGINE_LIBRARY = deb3;
      console.log('✅ Pointed PRISMA_QUERY_ENGINE_LIBRARY to Debian 3.0 engine:', deb3);
      return;
    }
  }
}
configurePrismaEngine();

const next = require('next');

const dev = false;
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

console.log('Starting Next.js production server on port ' + port + '...');
console.log('Database URL configured:', process.env.DATABASE_URL ? 'YES' : 'NO');
console.log('Tokio worker threads limit:', process.env.TOKIO_WORKER_THREADS);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer(async (req, res) => {
    try {
      // Disable LiteSpeed reverse-proxy response buffering
      res.setHeader('X-Accel-Buffering', 'no');
      
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request ' + req.url + ':', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, () => {
    console.log('> Ready on http://' + hostname + ':' + port);
  });
}).catch((err) => {
  console.error('Next.js preparation failed:', err);
  process.exit(1);
});
`;
fs.writeFileSync(path.join(stageDir, 'server.js'), prodServerJs);

// 7. Compress into clean zip
console.log('\n📦 Compressing to nextjs-cpanel-production.zip...');
if (fs.existsSync(deployZip)) fs.unlinkSync(deployZip);
execSync('tar.exe -a -c -f "' + deployZip + '" -C "' + stageDir + '" .', { stdio: 'inherit' });

const sizeMB = (fs.statSync(deployZip).size / (1024 * 1024)).toFixed(2);
console.log('\\n🎉 SUCCESS! Created production zip: ' + deployZip + ' (' + sizeMB + ' MB)');
