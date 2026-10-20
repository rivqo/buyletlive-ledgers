import type { SurfaceFill } from '@bluebulb/ui';
import type { BluebulbConfig } from './bluebulb';
import type { Brand } from './brand';

/** Defaults when the brief left look unset. */
export const defaultLook = {
  sign_in: { layout: 'split' as const, show_logo: true },
  chrome: { placement: 'sidebar' as const, tone: 'brand' as const },
  dashboard: { greeting: 'hero' as const, tiles: 'icon' as const },
};

export type AppLook = NonNullable<BluebulbConfig['look']>;

type Dashboard = NonNullable<AppLook['dashboard']>;

/** The project's look with defaults filled. */
export function resolveLook(
  config: BluebulbConfig,
): Required<Pick<AppLook, 'sign_in' | 'chrome'>> & AppLook & { dashboard: Required<Dashboard> } {
  const look = config.look ?? {};
  return {
    ...look,
    sign_in: {
      layout: look.sign_in?.layout ?? defaultLook.sign_in.layout,
      show_logo: look.sign_in?.show_logo ?? defaultLook.sign_in.show_logo,
      panel: look.sign_in?.panel,
      brand_panel: look.sign_in?.brand_panel,
    },
    chrome: {
      placement: look.chrome?.placement ?? defaultLook.chrome.placement,
      tone: look.chrome?.tone ?? defaultLook.chrome.tone,
      background: look.chrome?.background,
    },
    dashboard: {
      greeting: look.dashboard?.greeting ?? defaultLook.dashboard.greeting,
      tiles: look.dashboard?.tiles ?? defaultLook.dashboard.tiles,
    },
    fonts: look.fonts,
  };
}

type StoredFill = NonNullable<NonNullable<AppLook['sign_in']>['panel']>;

/** Turns a stored fill into a SurfaceFill, attaching the brand's hero when kind is hero. */
export function toSurfaceFill(fill: StoredFill | undefined, brand: Brand): SurfaceFill | undefined {
  if (!fill) return undefined;
  if (fill.kind === 'hero') return { kind: 'hero', imageUrl: brand.heroUrl };
  return { kind: fill.kind };
}
