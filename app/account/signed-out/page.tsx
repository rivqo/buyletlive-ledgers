import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { safeReturnTo } from '@bluebulb/staff-auth';
import { SignInPanel } from '@/components/sign-in-panel';
import { projectConfig } from '@/lib/auth';
import { loadBrand } from '@/lib/brand';
import { CUSTOMER_BASE, customers, customersOn } from '@/lib/customers';

export const metadata: Metadata = { title: 'Sign in' };

const REASONS: Record<string, { title: string; body: string }> = {
  expired: {
    title: 'Sign-in took too long.',
    body: 'The sign-in page was open for more than 10 minutes. Sign in again.',
  },
  failed: {
    title: 'Sign-in didn’t finish.',
    body: 'Sign in again. If it keeps happening, contact us.',
  },
  'access-unavailable': {
    title: 'We couldn’t check your account.',
    body: 'Something on our side didn’t answer. Try again in a minute.',
  },
};

/**
 * The customer area's front door, in the owner's brand (ADR 0030). Signing in, and signing up,
 * happen on the shared sign-in pages with an email and password; passwords never touch this app.
 */
export default async function CustomerSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; return_to?: string }>;
}) {
  if (!customersOn) notFound();
  const { reason, return_to } = await searchParams;
  const brand = await loadBrand(projectConfig);
  const back = safeReturnTo(return_to, CUSTOMER_BASE);
  return (
    <SignInPanel
      brand={brand}
      title={projectConfig.title}
      heading={`Sign in to ${projectConfig.title}`}
      lede="Use your email and password. New here? You can create an account on the next page."
      problem={reason ? REASONS[reason] : undefined}
      href={`${customers.paths.signIn}?${new URLSearchParams({ return_to: back })}`}
      footnote={`${brand.name} uses your details only to deal with what you register here.`}
    />
  );
}
