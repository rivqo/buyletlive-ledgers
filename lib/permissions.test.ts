import { ACCESS_MANAGE, catalogueErrors } from '@bluebulb/core';
import { describe, expect, it } from 'vitest';
import { CUSTOMER_NAV, NAV, navFor } from './nav';
import { P, catalogue } from './permissions';
import { TOURS } from './tours';

describe('the catalogue', () => {
  it('is one platform-api will accept', () => {
    expect(catalogueErrors(catalogue)).toEqual([]);
    expect(P.accessManage).toBe(ACCESS_MANAGE);
  });

  it('declares every permission the menu names', () => {
    const declared = new Set([ACCESS_MANAGE, ...catalogue.permissions.map((p) => p.key)]);
    for (const page of [...NAV, ...CUSTOMER_NAV].flatMap((g) => g.pages)) {
      expect(declared).toContain(page.permission);
    }
  });

  it('keeps customer permissions to the customer area (ADR 0030)', () => {
    const customer = (p: string) => p.startsWith('customer:');
    expect(CUSTOMER_NAV.flatMap((g) => g.pages).every((p) => customer(p.permission))).toBe(true);
    expect(NAV.flatMap((g) => g.pages).some((p) => customer(p.permission))).toBe(false);
    // The staff development wildcard never opens the customer menu.
    expect(navFor(['*'], CUSTOMER_NAV)).toEqual([]);
    expect(navFor(['customer:*'], CUSTOMER_NAV).flatMap((g) => g.pages)).toHaveLength(2);
  });
});

describe('navFor', () => {
  it('shows only the pages a person’s permissions allow, and drops empty groups', () => {
    const member = navFor([P.dashboardView, P.helpView]);
    expect(member.flatMap((g) => g.pages.map((p) => p.href))).toEqual(['/', '/help']);
    expect(member.map((g) => g.label)).not.toContain('Admin');
    expect(navFor([]).length).toBe(0);
    expect(navFor(['*']).flatMap((g) => g.pages)).toHaveLength(NAV.flatMap((g) => g.pages).length);
  });

  it('has a tour for every page in the menu', () => {
    for (const page of [...NAV, ...CUSTOMER_NAV].flatMap((g) => g.pages)) {
      expect(TOURS[page.href]).toBeTruthy();
    }
  });
});
