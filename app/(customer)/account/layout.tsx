import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { AccountMenu, THEME_COOKIE, ThemeMenu, readThemePreference } from '@bluebulb/ui';
import { AppFrame } from '@/components/app-frame';
import { BrandLogo } from '@/components/brand-logo';
import { projectConfig } from '@/lib/auth';
import { loadBrand } from '@/lib/brand';
import { customers, customersOn } from '@/lib/customers';
import { resolveLook, toSurfaceFill } from '@/lib/look';
import { CUSTOMER_NAV, navFor } from '@/lib/nav';

export const dynamic = 'force-dynamic';

/**
 * Every page of the customer area (ADR 0030): the same shell in the owner's brand, with the
 * customer menu only. Its session is the customer one; a staff session never reaches here.
 */
export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  if (!customersOn) notFound();
  const session = await customers.requireSession();
  const [brand, pref] = await Promise.all([
    loadBrand(projectConfig),
    cookies().then((c) => readThemePreference(c.get(THEME_COOKIE)?.value)),
  ]);
  const look = resolveLook(projectConfig);
  return (
    <AppFrame
      nav={navFor(customers.permissionsOf(session), CUSTOMER_NAV)}
      brand={<BrandLogo brand={brand} title={projectConfig.title} />}
      brandMark={<BrandLogo brand={brand} title={projectConfig.title} compact />}
      chrome={look.chrome}
      pageBackground={toSurfaceFill(look.chrome.background, brand)}
      topBar={
        <>
          <ThemeMenu initial={pref} />
          <AccountMenu
            name={session.name}
            email={session.email}
            detail="Customer account"
            signOutAction={customers.paths.signOut}
          />
        </>
      }
      footer={
        <div className="flex flex-wrap justify-between gap-2">
          <span>
            {new Date().getFullYear()} © {brand.name}
          </span>
          <span>{projectConfig.title}</span>
        </div>
      }
    >
      {children}
    </AppFrame>
  );
}
