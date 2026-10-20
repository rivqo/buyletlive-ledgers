import { z } from 'zod';

/*
 * What a customer tells the app (ADR 0030): their details and the intents they register. The
 * template keeps them in memory so the example runs with nothing else; a real app keeps them in
 * its own database. Either way every read and write is keyed by the customer's id (`session.sub`),
 * never by anything from the form, so a customer only ever sees and changes their own.
 */

export const detailsSchema = z.object({
  name: z.string().trim().min(1, 'Enter your full name.').max(120),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+0-9 ()-]*$/, 'Use digits, spaces and + only, like +44 20 7946 0000.'),
  address: z.string().trim().max(300),
});
export type Details = z.infer<typeof detailsSchema>;

export const INTENT_KINDS = {
  purchase: 'Buy something',
  sale: 'Sell something',
  transfer: 'Move money',
} as const;
export const CURRENCIES = ['GBP', 'NGN', 'USD', 'EUR'] as const;

export const intentSchema = z.object({
  kind: z.enum(Object.keys(INTENT_KINDS) as [keyof typeof INTENT_KINDS], {
    message: 'Pick what it’s for.',
  }),
  /** Money as typed, like "1,250.50"; stored in minor units. */
  amount: z
    .string()
    .trim()
    .regex(/^[0-9][0-9,]*(\.[0-9]{1,2})?$/, 'Enter an amount like 1250 or 1,250.50.'),
  currency: z.enum(CURRENCIES, { message: 'Pick a currency.' }),
  when: z
    .string()
    .trim()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, 'Pick a date, or leave it empty.'),
  note: z.string().trim().max(500),
});

export interface Intent {
  id: string;
  kind: keyof typeof INTENT_KINDS;
  /** Integer minor units (pence, kobo, cents). */
  amountMinor: number;
  currency: (typeof CURRENCIES)[number];
  when: string | null;
  note: string;
  status: 'received';
  createdAt: string;
}

/** "1,250.50" → 125050. Never through floating point, so no pennies are lost. */
export function toMinorUnits(amount: string): number {
  const [whole, fraction = ''] = amount.replace(/,/g, '').split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}

/** In-memory records for one process; swap for the app's database. */
export class CustomerRecords {
  private readonly details = new Map<string, Details>();
  private readonly intents = new Map<string, Intent[]>();

  detailsOf(customerId: string): Details | null {
    return this.details.get(customerId) ?? null;
  }

  saveDetails(customerId: string, details: Details) {
    this.details.set(customerId, details);
  }

  intentsOf(customerId: string): Intent[] {
    return [...(this.intents.get(customerId) ?? [])].reverse();
  }

  addIntent(customerId: string, input: z.infer<typeof intentSchema>, now = new Date()): Intent {
    const intent: Intent = {
      id: `int_${crypto.randomUUID()}`,
      kind: input.kind,
      amountMinor: toMinorUnits(input.amount),
      currency: input.currency,
      when: input.when || null,
      note: input.note,
      status: 'received',
      createdAt: now.toISOString(),
    };
    this.intents.set(customerId, [...(this.intents.get(customerId) ?? []), intent]);
    return intent;
  }
}

/** One store for the process (kept across dev reloads). */
const g = globalThis as { __customerRecords?: CustomerRecords };
export const records = (g.__customerRecords ??= new CustomerRecords());
