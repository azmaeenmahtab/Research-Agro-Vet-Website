export interface AdminSession {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
  name: string;
}

export async function verifyAdminSession(): Promise<AdminSession | null> {
  // Skeleton session guard for Next.js App Router admin protection
  return null;
}

export function isAuthenticated(session: AdminSession | null): boolean {
  return Boolean(session && session.id);
}
