import { User, Session } from '../auth';

declare global {
  namespace Express {
    interface Request {
      user?: User & { role?: string | null };
      session?: Session['session'];
    }
  }
}

export {};
