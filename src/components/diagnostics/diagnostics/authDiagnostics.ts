
import { DiagnosticResult } from '../types';
import { User, Session } from '@supabase/supabase-js';

export const runAuthDiagnostics = async (
  user: User | null,
  session: Session | null,
  isAdmin: () => boolean
): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];

  try {
    results.push({
      name: 'Authentication Service',
      status: user ? 'pass' : 'warning',
      message: user ? 'User authenticated successfully' : 'No user authenticated',
      details: user ? [`User ID: ${user.id}`, `Email: ${user.email}`] : ['User should sign in to test auth'],
      category: 'auth'
    });

    results.push({
      name: 'Session Management',
      status: session ? 'pass' : 'warning',
      message: session ? 'Active session found' : 'No active session',
      details: session ? [`Session expires: ${new Date(session.expires_at! * 1000).toLocaleString()}`] : [],
      category: 'auth'
    });

    results.push({
      name: 'Role System',
      status: 'pass',
      message: `Role check functional - Admin: ${isAdmin()}`,
      details: [`Admin access: ${isAdmin() ? 'Yes' : 'No'}`],
      category: 'auth'
    });
  } catch (error) {
    results.push({
      name: 'Authentication Service',
      status: 'fail',
      message: 'Authentication system error',
      details: [error instanceof Error ? error.message : 'Unknown auth error'],
      category: 'auth'
    });
  }

  return results;
};
