'use client';

import {
  CircleHelp,
  FileSignature,
  LayoutDashboard,
  Palette,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { ProductShell, type ShellNavSection, type SurfaceFill } from '@bluebulb/ui';
import type { IconName, NavGroup } from '@/lib/nav';
import type { AppLook } from '@/lib/look';
import { PageTour } from './page-tour';

const ICONS: Record<IconName, React.ReactNode> = {
  dashboard: <LayoutDashboard aria-hidden className="size-4" />,
  users: <Users aria-hidden className="size-4" />,
  roles: <ShieldCheck aria-hidden className="size-4" />,
  design: <Palette aria-hidden className="size-4" />,
  help: <CircleHelp aria-hidden className="size-4" />,
  details: <UserRound aria-hidden className="size-4" />,
  intents: <FileSignature aria-hidden className="size-4" />,
};

/** The page is current when it's this path or below it (`/admin/users/123` is under Users). */
const under = (href: string, path: string) =>
  href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`);

/** The closest page wins, so `/account/intents` isn't also marked under `/account`. */
const currentOf = (hrefs: string[], path: string) =>
  hrefs.filter((h) => under(h, path)).sort((a, b) => b.length - a.length)[0];

/**
 * The frame every signed-in page sits in (ADR 0030): the product shell with the menu this person
 * may see, chrome from bluebulb.json's look, the top bar, and the page's tour.
 */
export function AppFrame({
  nav,
  brand,
  brandMark,
  topBar,
  footer,
  chrome,
  pageBackground,
  children,
}: {
  nav: NavGroup[];
  brand: React.ReactNode;
  brandMark: React.ReactNode;
  topBar: React.ReactNode;
  footer: React.ReactNode;
  chrome: NonNullable<AppLook['chrome']>;
  pageBackground?: SurfaceFill;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const current = currentOf(
    nav.flatMap((g) => g.pages.map((p) => p.href)),
    path,
  );
  const sections: ShellNavSection[] = nav.map((g) => ({
    label: g.label,
    items: g.pages.map((p) => ({
      href: p.href,
      label: p.label,
      icon: ICONS[p.icon],
      current: p.href === current,
    })),
  }));
  return (
    <ProductShell
      brand={brand}
      brandMark={brandMark}
      nav={sections}
      navPlacement={chrome.placement ?? 'sidebar'}
      chromeTone={chrome.tone ?? 'brand'}
      pageBackground={pageBackground}
      linkAs={Link}
      topBar={
        <>
          <Suspense fallback={null}>
            <PageTour path={path} />
          </Suspense>
          {topBar}
        </>
      }
      footer={footer}
    >
      {children}
    </ProductShell>
  );
}
