import { cookies } from 'next/headers';
import { AccountMenu, THEME_COOKIE, ThemeMenu, readThemePreference } from '@bluebulb/ui';
import { AppFrame } from '@/components/app-frame';
import { BrandLogo } from '@/components/brand-logo';
import { auth, projectConfig } from '@/lib/auth';
import { loadBrand } from '@/lib/brand';
import { resolveLook, toSurfaceFill } from '@/lib/look';
import { navFor } from '@/lib/nav';

export const dynamic = 'force-dynamic';

/** Every signed-in page: the shell, with the menu this person's roles allow (ADR 0030). */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.requireSession();
  const [brand, pref] = await Promise.all([
    loadBrand(projectConfig),
    cookies().then((c) => readThemePreference(c.get(THEME_COOKIE)?.value)),
  ]);
  const look = resolveLook(projectConfig);
  const roles = session.access?.roles ?? [];
  return (
    <AppFrame
      nav={navFor(auth.permissionsOf(session))}
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
            detail={roles.length ? `Roles: ${roles.join(', ')}` : 'No role yet'}
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
