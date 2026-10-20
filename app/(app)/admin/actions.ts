'use server';

import { revalidatePath } from 'next/cache';
import { NotAllowedError } from '@bluebulb/staff-auth/server';
import { assignRole, createRole, problemText, unassignRole } from '@/lib/access';
import { auth } from '@/lib/auth';
import { P } from '@/lib/permissions';

export type Result = { error: string } | { error?: undefined };

/** Checks `access:manage` here first; platform-api checks it again. */
async function asManager(
  fn: (session: Awaited<ReturnType<typeof auth.requirePermission>>) => Promise<void>,
): Promise<Result> {
  try {
    const session = await auth.requirePermission(P.accessManage);
    await fn(session);
    revalidatePath('/admin', 'layout');
    return {};
  } catch (err) {
    if (err instanceof NotAllowedError) return { error: err.message };
    return { error: problemText(err) };
  }
}

export const giveRole = async (roleKey: string, personId: string) =>
  asManager((s) => assignRole(s, roleKey, personId));

export const takeRole = async (assignmentId: string) =>
  asManager((s) => unassignRole(s, assignmentId));

/** `idempotencyKey` is made once per dialog opening, so a retried submit makes one role. */
export const makeRole = async (
  role: { key: string; name: string; description: string | null; permissions: string[] },
  idempotencyKey: string,
) => asManager((s) => createRole(s, role, idempotencyKey));
