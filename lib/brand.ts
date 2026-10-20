import 'server-only';
import {
  brandThemeCss,
  sbuBrands,
  type BrandColors,
  type BrandStyle,
  type SbuSlug,
} from '@bluebulb/tokens';
import type { BluebulbConfig } from './bluebulb';

/*
 * The owner's brand (ADR 0022, 0029): name, logos, hero picture and colours, from platform-api's
 * public brand, so a logo or picture changed in the console reaches the app within minutes. When
 * platform-api can't be reached, the built-in BlackCod brands (or the platform palette) stand in.
 */

export interface Brand {
  name: string;
  logoUrl: string | null;
  logoDarkUrl: string | null;
  heroUrl: string | null;
  colors: BrandColors | undefined;
  fonts?: { body?: string; display?: string };
  style?: BrandStyle;
}

interface PublicBrand {
  display_name: string;
  logo_url: string | null;
  logo_dark_url: string | null;
  hero_url?: string | null;
  colors: { primary: string; accent: string | null; [token: string]: string | null };
  fonts?: { body: string | null; display: string | null };
  style?: BrandStyle;
}

/** How long a brand is cached: a change in the console shows within this. */
const REVALIDATE_SECONDS = 300;

function fallback(config: BluebulbConfig): Brand {
  const known = sbuBrands[config.sbu as SbuSlug];
  return {
    name: known?.name ?? config.title,
    logoUrl: null,
    logoDarkUrl: null,
    heroUrl: null,
    colors: known?.colors,
  };
}

/** The owner's brand, from platform-api, else the built-in one. Never throws. */
export async function loadBrand(
  config: BluebulbConfig,
  env: Record<string, string | undefined> = process.env,
): Promise<Brand> {
  const base = env.PLATFORM_API_URL?.replace(/\/$/, '');
  if (!base) return fallback(config);
  try {
    const res = await fetch(`${base}/v1/brands/${encodeURIComponent(config.sbu)}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(3_000),
    } as RequestInit);
    if (!res.ok) return fallback(config);
    const b = (await res.json()) as PublicBrand;
    const colors = Object.fromEntries(
      Object.entries(b.colors).filter((e): e is [string, string] => typeof e[1] === 'string'),
    ) as BrandColors;
    return {
      name: b.display_name,
      logoUrl: b.logo_url,
      logoDarkUrl: b.logo_dark_url,
      heroUrl: b.hero_url ?? null,
      colors: colors.primary ? colors : fallback(config).colors,
      fonts: {
        body: b.fonts?.body ?? undefined,
        display: b.fonts?.display ?? undefined,
      },
      style: b.style,
    };
  } catch {
    return fallback(config);
  }
}

/** CSS for the brand, with the style and font overrides from bluebulb.json over the company's. */
export function brandCss(brand: Brand, config: BluebulbConfig): string {
  return brandThemeCss({
    colors: brand.colors,
    style: { ...brand.style, ...config.style },
    fonts: {
      body: config.look?.fonts?.body ?? brand.fonts?.body,
      display: config.look?.fonts?.display ?? brand.fonts?.display,
    },
  });
}
