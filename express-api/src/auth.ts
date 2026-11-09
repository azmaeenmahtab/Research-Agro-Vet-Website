import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { bearer, admin } from 'better-auth/plugins';
import { prisma } from './lib/prisma';

/**
 * Better Auth Configuration for Express API
 * 
 * Configured with the exact same PostgreSQL database and BETTER_AUTH_SECRET
 * as the Next.js frontend to allow seamless session verification across domains.
 * The bearer() plugin is registered to parse and validate tokens passed via
 * the `Authorization: Bearer <token>` header.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mysql',
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  plugins: [
    bearer(),
    admin(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

