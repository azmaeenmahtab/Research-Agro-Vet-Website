/**
 * Script to create or update an Admin user in the PostgreSQL database
 * compliant with Better Auth schema and Admin plugin.
 * 
 * Usage:
 *   # Create demo/default super admin:
 *   npm run create-admin -- --default
 * 
 *   # Create custom admin with CLI arguments:
 *   node scripts/create-admin.js --name "Admin Name" --email "admin@example.com" --password "secret123" --role "admin"
 * 
 *   # Interactive mode:
 *   npm run create-admin
 */

const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('better-auth/crypto');
const crypto = require('crypto');
const readline = require('readline');

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--default') {
      parsed.default = true;
    } else if (arg.startsWith('--') && i + 1 < args.length && !args[i + 1].startsWith('--')) {
      const key = arg.slice(2);
      parsed[key] = args[i + 1];
      i++;
    }
  }
  return parsed;
}

function prompt(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

async function main() {
  console.log('\n=============================================');
  console.log('   Research Agro Vet - Better Auth Admin');
  console.log('=============================================\n');

  const args = parseArgs();

  let name = args.name;
  let email = args.email;
  let password = args.password;
  let role = (args.role || 'admin').toLowerCase();

  if (args.default) {
    name = name || 'Super Administrator';
    email = email || 'admin@researchagrovet.com';
    password = password || 'Admin@2026!';
    role = 'admin';
    console.log('ℹ️ Using default administrator configuration.');
  } else {
    if (!name) {
      name = await prompt('Enter Admin Full Name [Super Administrator]: ') || 'Super Administrator';
    }
    if (!email) {
      email = await prompt('Enter Admin Email [admin@researchagrovet.com]: ') || 'admin@researchagrovet.com';
    }
    if (!password) {
      password = await prompt('Enter Admin Password (min 6 chars) [Admin@2026!]: ') || 'Admin@2026!';
    }
  }

  if (!email || !email.includes('@')) {
    console.error('❌ Invalid email address provided.');
    process.exit(1);
  }

  if (!password || password.length < 6) {
    console.error('❌ Password must be at least 6 characters long.');
    process.exit(1);
  }

  const cleanEmail = email.toLowerCase().trim();
  const hashedPassword = await hashPassword(password);

  console.log('\nConnecting to database...');

  // 1. Upsert Better Auth User table
  let user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  const userId = user ? user.id : crypto.randomUUID();

  if (user) {
    user = await prisma.user.update({
      where: { email: cleanEmail },
      data: {
        name,
        role: 'admin',
        banned: false,
      },
    });
    console.log(`✅ Better Auth user "${cleanEmail}" updated with role: admin.`);
  } else {
    user = await prisma.user.create({
      data: {
        id: userId,
        name,
        email: cleanEmail,
        emailVerified: true,
        role: 'admin',
        banned: false,
      },
    });
    console.log(`✅ Better Auth user "${cleanEmail}" created with role: admin.`);
  }

  // 2. Upsert Better Auth Account credentials table
  const accountId = `credential_${user.id}`;
  const existingAccount = await prisma.account.findFirst({
    where: { userId: user.id, providerId: 'credential' },
  });

  if (existingAccount) {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: {
        password: hashedPassword,
      },
    });
  } else {
    await prisma.account.create({
      data: {
        id: accountId,
        userId: user.id,
        accountId: user.id,
        providerId: 'credential',
        password: hashedPassword,
      },
    });
  }

  console.log('✅ Better Auth credential password hash stored successfully!');

  // 3. Keep legacy AdminUser table synced
  try {
    const legacySalt = crypto.randomBytes(16).toString('hex');
    const legacyHash = crypto.scryptSync(password, legacySalt, 64).toString('hex');
    const legacyPassHash = `${legacySalt}:${legacyHash}`;

    await prisma.adminUser.upsert({
      where: { email: cleanEmail },
      update: { name, passwordHash: legacyPassHash, role: 'SUPER_ADMIN', isActive: true },
      create: { name, email: cleanEmail, passwordHash: legacyPassHash, role: 'SUPER_ADMIN', isActive: true },
    });
  } catch (e) {
    // optional sync
  }

  console.log('\n---------------------------------------------');
  console.log('Admin Account Ready:');
  console.log(`- ID:       ${user.id}`);
  console.log(`- Name:     ${user.name}`);
  console.log(`- Email:    ${user.email}`);
  console.log(`- Role:     ${user.role}`);
  console.log(`- Provider: credential`);
  console.log('---------------------------------------------\n');
  console.log('You can now log in at: /admin/auth/login\n');
}

main()
  .catch((err) => {
    console.error('❌ Error creating admin account:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
