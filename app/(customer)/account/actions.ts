'use server';

import { revalidatePath } from 'next/cache';
import { NotAllowedError } from '@bluebulb/staff-auth/server';
import { detailsSchema, intentSchema, records } from '@/lib/customer-records';
import { customers } from '@/lib/customers';
import { P } from '@/lib/permissions';

export interface FormResult {
  ok?: boolean;
  error?: string;
  /** Per field, worded for the customer. */
  fields?: Record<string, string>;
  /** What they typed, kept after an error. */
  values?: Record<string, string>;
}

const read = (f: FormData, names: string[]) =>
  Object.fromEntries(names.map((n) => [n, String(f.get(n) ?? '')]));

const fieldErrors = (issues: { path: PropertyKey[]; message: string }[]) =>
  Object.fromEntries(issues.map((i) => [String(i.path[0]), i.message]));

/**
 * Saves the signed-in customer's own details. The permission is checked here, where it holds;
 * the record is keyed by their id from the session, never by anything in the form.
 */
export async function saveDetails(_: FormResult, f: FormData): Promise<FormResult> {
  const values = read(f, ['name', 'phone', 'address']);
  try {
    const session = await customers.requirePermission(P.customerDetailsEdit);
    const parsed = detailsSchema.safeParse(values);
    if (!parsed.success) return { fields: fieldErrors(parsed.error.issues), values };
    records.saveDetails(session.sub, parsed.data);
  } catch (err) {
    if (err instanceof NotAllowedError) return { error: err.message, values };
    throw err;
  }
  revalidatePath('/account');
  return { ok: true };
}

/** Registers an intent for the signed-in customer. */
export async function registerIntent(_: FormResult, f: FormData): Promise<FormResult> {
  const values = read(f, ['kind', 'amount', 'currency', 'when', 'note']);
  try {
    const session = await customers.requirePermission(P.customerIntentCreate);
    const parsed = intentSchema.safeParse(values);
    if (!parsed.success) return { fields: fieldErrors(parsed.error.issues), values };
    records.addIntent(session.sub, parsed.data);
  } catch (err) {
    if (err instanceof NotAllowedError) return { error: err.message, values };
    throw err;
  }
  revalidatePath('/account/intents');
  return { ok: true };
}
