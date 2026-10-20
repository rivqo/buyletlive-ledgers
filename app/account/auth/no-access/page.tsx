import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CustomerNoAccessPage } from '@bluebulb/staff-auth/pages';
import { projectConfig } from '@/lib/auth';
import { customers, customersOn } from '@/lib/customers';

export const metadata: Metadata = { title: 'No access' };
export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  if (!customersOn) notFound();
  const { reason } = await searchParams;
  return <CustomerNoAccessPage auth={customers} appName={projectConfig.title} reason={reason} />;
}
