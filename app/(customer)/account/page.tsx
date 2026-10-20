import type { Metadata } from 'next';
import { Card, CardContent, PageHeader } from '@bluebulb/ui';
import { DetailsForm } from '@/components/customer-forms';
import { NoPermission } from '@/components/no-permission';
import { records } from '@/lib/customer-records';
import { customers } from '@/lib/customers';
import { P } from '@/lib/permissions';

export const metadata: Metadata = { title: 'Your details' };
export const dynamic = 'force-dynamic';

/** A customer's own details (ADR 0030): theirs to see and change, keyed by their account. */
export default async function DetailsPage() {
  const session = await customers.requireSession();
  if (!customers.can(session, P.customerDetailsEdit)) {
    return <NoPermission permission={P.customerDetailsEdit} what="your details" />;
  }
  return (
    <>
      <PageHeader
        title="Your details"
        description={`Signed in as ${session.email}. Keep these up to date so we can reach you.`}
      />
      <Card>
        <CardContent className="p-5">
          <DetailsForm details={records.detailsOf(session.sub)} fallbackName={session.name} />
        </CardContent>
      </Card>
    </>
  );
}
