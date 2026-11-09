const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Creating ultra-clean cPanel package (WITHOUT node_modules)...\n');

const rootDir = path.join(__dirname, '..');
const stageDir = path.join(rootDir, 'cpanel-deployment', 'stage-clean');
const deployZip = path.join(rootDir, 'cpanel-deployment', 'nextjs-cpanel-clean.zip');

if (fs.existsSync(stageDir)) {
  fs.rmSync(stageDir, { recursive: true, force: true });
}
fs.mkdirSync(stageDir, { recursive: true });

// 1. Copy only required .next production assets
console.log('1️⃣ Copying production .next assets...');
const nextDest = path.join(stageDir, '.next');
fs.mkdirSync(nextDest, { recursive: true });

// Copy server and static
fs.cpSync(path.join(rootDir, '.next', 'server'), path.join(nextDest, 'server'), { recursive: true });
fs.cpSync(path.join(rootDir, '.next', 'static'), path.join(nextDest, 'static'), { recursive: true });

// Copy all manifest files and markers
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
console.log('   ✅ Production .next copied.');

// 2. Copy public
console.log('2️⃣ Copying public folder...');
fs.cpSync(path.join(rootDir, 'public'), path.join(stageDir, 'public'), { recursive: true });

// 3. Copy package manifests
console.log('3️⃣ Copying package manifests...');
fs.copyFileSync(path.join(rootDir, 'package.json'), path.join(stageDir, 'package.json'));
if (fs.existsSync(path.join(rootDir, 'package-lock.json'))) {
  fs.copyFileSync(path.join(rootDir, 'package-lock.json'), path.join(stageDir, 'package-lock.json'));
}

// 4. Create .npmrc with legacy-peer-deps=true so CloudLinux npm install succeeds!
console.log('4️⃣ Creating .npmrc with legacy-peer-deps=true...');
fs.writeFileSync(path.join(stageDir, '.npmrc'), 'legacy-peer-deps=true\n');

// 5. Copy prisma folder
console.log('5️⃣ Copying prisma folder...');
fs.cpSync(path.join(rootDir, 'prisma'), path.join(stageDir, 'prisma'), { recursive: true });

// 6. Create production server.js
console.log('6️⃣ Creating production server.js...');
const serverJsContent = `// Production Server for cPanel / CloudLinux LiteSpeed
const http = require('http');
const { parse } = require('url');
const next = require('next');

const dev = false;
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

console.log('Starting Next.js production server on port ' + port + '...');

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer(async (req, res) => {
    try {
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
fs.writeFileSync(path.join(stageDir, 'server.js'), serverJsContent);

console.log('\n📦 Compressing to nextjs-cpanel-clean.zip...');
if (fs.existsSync(deployZip)) fs.unlinkSync(deployZip);
execSync('tar.exe -a -c -f "' + deployZip + '" -C "' + stageDir + '" .', { stdio: 'inherit' });

const sizeMB = (fs.statSync(deployZip).size / (1024 * 1024)).toFixed(2);
console.log('\n🎉 SUCCESS! Created clean zip: ' + deployZip + ' (' + sizeMB + ' MB)');
