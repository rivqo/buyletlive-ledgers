import { SignInScreen } from '@bluebulb/ui';
import type { Brand } from '@/lib/brand';
import { projectConfig } from '@/lib/auth';
import { resolveLook, toSurfaceFill } from '@/lib/look';
import { BrandLogo } from './brand-logo';

/**
 * A branded front door (ADR 0030): layout, logo and fills come from bluebulb.json's look.
 * Staff (app/signed-out) and customers (app/account/signed-out) each get one.
 */
export function SignInPanel({
  brand,
  title,
  heading,
  lede,
  problem,
  href,
  footnote,
}: {
  brand: Brand;
  title: string;
  heading: string;
  lede: string;
  problem?: { title: string; body: string };
  href: string;
  footnote: string;
}) {
  const look = resolveLook(projectConfig);
  return (
    <SignInScreen
      layout={look.sign_in.layout}
      brandName={brand.name}
      title={title}
      heading={heading}
      lede={lede}
      problem={problem}
      href={href}
      footnote={footnote}
      showLogo={look.sign_in.show_logo}
      logo={<BrandLogo brand={brand} title={title} />}
      panel={toSurfaceFill(look.sign_in.panel, brand)}
      brandPanel={toSurfaceFill(look.sign_in.brand_panel ?? { kind: 'hero' }, brand)}
    />
  );
}
