import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, bearer } from 'better-auth/plugins';
import { prisma } from './prisma';

const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL;

const getTrustedOrigins = (): string[] => {
  const origins = new Set<string>();

  // 1. Explicit comma-separated list from TRUSTED_ORIGINS or BETTER_AUTH_TRUSTED_ORIGINS
  const envOrigins =
    process.env.TRUSTED_ORIGINS ||
    process.env.BETTER_AUTH_TRUSTED_ORIGINS ||
    '';

  if (envOrigins) {
    envOrigins
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
      .forEach((origin) => origins.add(origin));
  }

  // 2. Automatically trust origins from configured environment URLs
  const candidateEnvUrls = [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.FRONTEND_URL,
  ];

  for (const url of candidateEnvUrls) {
    if (url) {
      try {
        origins.add(new URL(url).origin);
      } catch {
        if (url.startsWith('http://') || url.startsWith('https://')) {
          origins.add(url.replace(/\/+$/, ''));
        }
      }
    }
  }

  return Array.from(origins);
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mysql',
  }),
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: getTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    bearer(),
    admin(),
  ],
});

export type Session = typeof auth.$Infer.Session;
