import type { Metadata } from 'next';
import { safeReturnTo } from '@bluebulb/staff-auth';
import { SignInPanel } from '@/components/sign-in-panel';
import { projectConfig } from '@/lib/auth';
import { loadBrand } from '@/lib/brand';

export const metadata: Metadata = { title: 'Sign in' };

const REASONS: Record<string, { title: string; body: string }> = {
  expired: {
    title: 'Sign-in took too long.',
    body: 'The sign-in page was open for more than 10 minutes. Sign in again.',
  },
  failed: {
    title: 'Sign-in didn’t finish.',
    body: 'Sign in again; if it keeps happening, tell the platform team.',
  },
  'access-unavailable': {
    title: 'Your access couldn’t be checked.',
    body: 'platform-api didn’t answer, so the app can’t tell whether you may use it. Try again in a minute.',
  },
};

/**
 * The app's front door in its owner's brand (ADR 0030): logo, picture and one button. Signing in
 * itself is the shared staff sign-in (Zitadel, with Google), so passwords never touch this app.
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; return_to?: string }>;
}) {
  const { reason, return_to } = await searchParams;
  const brand = await loadBrand(projectConfig);
  return (
    <SignInPanel
      brand={brand}
      title={projectConfig.title}
      heading={`Sign in to ${projectConfig.title}`}
      lede={`Use your ${brand.name} work account.`}
      problem={reason ? REASONS[reason] : undefined}
      // Back to where they were going, never off this site.
      href={`/auth/sign-in?${new URLSearchParams({ return_to: safeReturnTo(return_to) })}`}
      footnote={`Only people ${brand.name} has given access can sign in. Ask your manager if you can’t.`}
    />
  );
}
