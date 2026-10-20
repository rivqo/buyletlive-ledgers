import type { Metadata } from 'next';
import { NoAccessPage } from '@bluebulb/staff-auth/pages';
import { auth, projectConfig } from '@/lib/auth';

export const metadata: Metadata = { title: 'No access' };
export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; request?: string }>;
}) {
  const { reason, request } = await searchParams;
  return (
    <NoAccessPage auth={auth} appName={projectConfig.title} reason={reason} request={request} />
  );
}
