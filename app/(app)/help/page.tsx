import type { Metadata } from 'next';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  PageHeader,
  SearchInput,
} from '@bluebulb/ui';
import { NoPermission } from '@/components/no-permission';
import { auth, projectConfig } from '@/lib/auth';
import { TOPICS } from '@/lib/help';
import { navFor } from '@/lib/nav';
import { P } from '@/lib/permissions';
import { TOURS } from '@/lib/tours';

export const metadata: Metadata = { title: 'Help' };
export const dynamic = 'force-dynamic';

const matches = (q: string, ...texts: string[]) => texts.some((t) => t.toLowerCase().includes(q));

/** Topics and a tour for every page this person can open (ADR 0030). */
export default async function HelpPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth.requireSession();
  if (!auth.can(session, P.helpView)) return <NoPermission permission={P.helpView} what="help" />;
  const q = (await searchParams).q?.trim().toLowerCase() ?? '';
  // Only tours of pages they can open, in menu order.
  const pages = navFor(auth.permissionsOf(session)).flatMap((g) => g.pages);
  const tours = pages
    .filter((p) => TOURS[p.href])
    .map((p) => ({ href: p.href, ...TOURS[p.href]! }))
    .filter((t) => !q || matches(q, t.title, t.summary));
  const topics = TOPICS.filter((t) => !q || matches(q, t.title, t.summary, ...t.body));

  return (
    <>
      <PageHeader
        title="Help"
        description={`How to find your way around ${projectConfig.title}.`}
      />
      <form method="get" data-tour="help-search" className="max-w-xl">
        <SearchInput
          name="q"
          defaultValue={q}
          placeholder="Search topics and tours"
          aria-label="Search help"
        />
      </form>
      {q && tours.length === 0 && topics.length === 0 && (
        <EmptyState
          title={`Nothing matches “${q}”`}
          description="Try another word, or clear the search to see every topic and tour."
          action={
            <Link href="/help" className="text-sm font-medium underline">
              Clear search
            </Link>
          }
        />
      )}
      {tours.length > 0 && (
        <section aria-labelledby="tours" data-tour="help-tours" className="flex flex-col gap-3">
          <h2 id="tours" className="text-base font-semibold">
            Tours
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {tours.map((t) => (
              <Card key={t.href}>
                <CardHeader
                  actions={
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`${t.href}?tour=1`}>
                        <Compass aria-hidden /> Take the tour
                      </Link>
                    </Button>
                  }
                >
                  <CardTitle as="h3">{t.title}</CardTitle>
                  <CardDescription>{t.summary}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      )}
      {topics.length > 0 && (
        <section aria-labelledby="topics" data-tour="help-topics" className="flex flex-col gap-3">
          <h2 id="topics" className="text-base font-semibold">
            Topics
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {topics.map((t) => (
              <Card key={t.id} id={t.id}>
                <CardHeader>
                  <CardTitle as="h3">{t.title}</CardTitle>
                  <CardDescription>{t.summary}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                  {t.body.map((para) => (
                    <p key={para}>{para}</p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
