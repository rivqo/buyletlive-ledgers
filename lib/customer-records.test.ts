import { describe, expect, it } from 'vitest';
import { CustomerRecords, detailsSchema, intentSchema, toMinorUnits } from './customer-records';

describe('customer records (ADR 0030)', () => {
  it('keeps each customer’s records apart', () => {
    const r = new CustomerRecords();
    r.saveDetails('cus_a', { name: 'Ada', phone: '', address: '' });
    r.addIntent('cus_a', { kind: 'sale', amount: '10', currency: 'GBP', when: '', note: '' });
    expect(r.detailsOf('cus_b')).toBeNull();
    expect(r.intentsOf('cus_b')).toEqual([]);
    expect(r.intentsOf('cus_a')).toHaveLength(1);
  });

  it('stores money in minor units without floating point', () => {
    expect(toMinorUnits('1,250.5')).toBe(125050);
    expect(toMinorUnits('0.07')).toBe(7);
    expect(toMinorUnits('19')).toBe(1900);
  });

  it('says what to fix in a form', () => {
    const details = detailsSchema.safeParse({ name: '', phone: 'call me', address: '' });
    expect(details.error?.issues.map((i) => i.message)).toEqual([
      'Enter your full name.',
      'Use digits, spaces and + only, like +44 20 7946 0000.',
    ]);
    const intent = intentSchema.safeParse({
      kind: 'sale',
      amount: '12.345',
      currency: 'GBP',
      when: '',
      note: '',
    });
    expect(intent.error?.issues[0]?.message).toMatch(/amount like/);
  });
});
