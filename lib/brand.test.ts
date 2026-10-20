import { describe, expect, it, vi } from 'vitest';
import type { BluebulbConfig } from './bluebulb';

// `server-only` throws outside a React server build; this module is server code under test.
vi.mock('server-only', () => ({}));
const { brandCss } = await import('./brand');

const brand = {
  name: 'Acme',
  logoUrl: null,
  logoDarkUrl: null,
  heroUrl: null,
  colors: { primary: '#1d4ed8' },
  fonts: { body: 'manrope', display: 'fraunces' },
  style: { shape: 'sharp' as const, surface: 'flat' as const },
};
const config = { title: 'Ledger', sbu: 'acme' } as BluebulbConfig;

describe('brandCss', () => {
  it("wears the company's style and fonts when bluebulb.json sets none", () => {
    const css = brandCss(brand, config);
    expect(css).toContain('Manrope');
    expect(css).toContain('Fraunces');
    // `sharp` corners: the smallest radius is 2px.
    expect(css).toMatch(/--bb-radius-sm: 2px/);
  });

  it("lets the project's own look win", () => {
    const css = brandCss(brand, {
      ...config,
      style: { shape: 'round' },
      look: { fonts: { body: 'inter' } },
    } as BluebulbConfig);
    expect(css).toContain('Inter');
    expect(css).not.toContain('Manrope');
    expect(css).not.toMatch(/--bb-radius-sm: 2px/);
    // The display face isn't set by the project, so the company's stays.
    expect(css).toContain('Fraunces');
  });
});
