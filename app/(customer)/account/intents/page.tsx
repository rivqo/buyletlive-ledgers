import type { Metadata } from 'next';
import { FileText } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  formatMoney,
} from '@bluebulb/ui';
import { IntentForm } from '@/components/customer-forms';
import { NoPermission } from '@/components/no-permission';
import { INTENT_KINDS, records } from '@/lib/customer-records';
import { customers } from '@/lib/customers';
import { P } from '@/lib/permissions';

export const metadata: Metadata = { title: 'Register an intent' };
export const dynamic = 'force-dynamic';

/**
 * The example customer action (ADR 0030): register an intent, and see the ones they registered.
 * The list is a customer's own few records, so it shows them all; a real app pages it.
 */
export default async function IntentsPage() {
  const session = await customers.requireSession();
  if (!customers.can(session, P.customerIntentCreate)) {
    return <NoPermission permission={P.customerIntentCreate} what="intents" />;
  }
  const intents = records.intentsOf(session.sub);
  return (
    <>
      <PageHeader
        title="Register an intent"
        description="Tell us what you plan to do. We’ll be in touch before anything happens."
      />
      <Card>
        <CardContent className="p-5">
          <IntentForm />
        </CardContent>
      </Card>
      <Card data-tour="intent-list">
        <CardHeader>
          <CardTitle as="h2">Your intents</CardTitle>
        </CardHeader>
        <CardContent>
          {intents.length === 0 ? (
            <EmptyState
              icon={<FileText aria-hidden />}
              title="No intents yet"
              description="Register one above and it appears here with its status."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>For</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intents.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{INTENT_KINDS[i.kind]}</TableCell>
                    <TableCell>{formatMoney(i.amountMinor, i.currency)}</TableCell>
                    <TableCell>{i.when ?? 'Not set'}</TableCell>
                    <TableCell>
                      <Badge tone="neutral">Received</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
