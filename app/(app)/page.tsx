import Link from 'next/link';
import {
  Alert,
  AttentionPanel,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DashboardGreeting,
  EmptyState,
  StatTile,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type AttentionItem,
} from '@bluebulb/ui';
import type { Session } from '@bluebulb/staff-auth';
import { Activity, Radio, Shield, Users } from 'lucide-react';
import { NoPermission } from '@/components/no-permission';
import { listPeople, problemText } from '@/lib/access';
import { auth, projectConfig } from '@/lib/auth';
import { resolveLook } from '@/lib/look';
import { P } from '@/lib/permissions';
import { loadWebhooks } from '@/lib/platform';
import { checkServices } from '@/lib/services';

export const dynamic = 'force-dynamic';

const seen = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/**
 * The app's home (ADR 0010, 0030, 0033): the greeting and what's waiting, the attention panel
 * straight after, then the numbers, who signed in lately and the services it depends on. Replace
 * the tiles and attention items with the product's own as it grows; keep the order. Give a tile
 * `previous` and `period` once the product has a number to compare with; never invent one.
 */
export default async function DashboardPage() {
  const session = await auth.requireSession();
  if (!auth.can(session, P.dashboardView)) {
    return <NoPermission permission={P.dashboardView} what="the dashboard" />;
  }
  const now = new Date();
  const [services, webhooks] = await Promise.all([
    checkServices(projectConfig),
    loadWebhooks(projectConfig, process.env),
  ]);
  const up = services.filter((s) => s.state === 'up').length;
  const items: AttentionItem[] = [
    ...services
      .filter((s) => s.state !== 'up')
      .map((s) => ({
        id: `service-${s.name}`,
        severity: s.state === 'down' ? ('critical' as const) : ('warning' as const),
        title: s.state === 'down' ? `${s.name} isn’t answering` : `${s.name} isn’t set up`,
        detail: `${s.detail} Parts of ${projectConfig.title} that use it won’t work until it does.`,
        since: now,
        detected: true,
        source: s.name,
      })),
    ...(webhooks.state === 'no-key'
      ? [
          {
            id: 'platform-key',
            severity: 'warning' as const,
            title: 'This app has no platform key',
            detail:
              'Without PLATFORM_API_KEY it can’t call platform services or send its roles to platform-api. The launcher sets it on staging.',
            since: now,
            detected: true,
            source: 'platform-api',
          },
        ]
      : []),
    ...(webhooks.state === 'forbidden'
      ? [
          {
            id: 'webhooks-scope',
            severity: 'warning' as const,
            title: `The platform key lacks ${webhooks.scope}`,
            detail: 'A platform admin can add the scope under API keys in the console.',
            since: now,
            detected: true,
            source: 'platform-api',
          },
        ]
      : []),
  ];
  const waiting = items.length;
  const look = resolveLook(projectConfig);
  const managesAccess = auth.can(session, P.accessManage);
  const webhooksCount = webhooks.state === 'ok' ? webhooks.endpoints.length : 0;
  const permissions = auth.permissionsOf(session).length;
  const rolesLabel = (session.access?.roles ?? []).join(', ') || 'No role yet';
  const compact = look.dashboard.tiles === 'compact';
  const tile = (icon: React.ReactNode) => ({
    animate: false,
    icon: look.dashboard.tiles === 'icon' ? icon : undefined,
    className: compact ? 'p-3' : undefined,
  });
  const help = auth.can(session, P.helpView) && (
    <Button asChild variant="secondary">
      <Link href="/help">Open help</Link>
    </Button>
  );

  return (
    <>
      <div data-tour="greeting">
        <DashboardGreeting
          variant={look.dashboard.greeting}
          name={session.name}
          waiting={waiting}
          now={now}
          actions={
            <>
              {waiting > 0 ? (
                <Button asChild>
                  <a href="#attention">Review what needs attention</a>
                </Button>
              ) : (
                managesAccess && (
                  <Button asChild>
                    <Link href="/admin/users">Manage users</Link>
                  </Button>
                )
              )}
              {help}
            </>
          }
        />
      </div>

      <div id="attention" data-tour="attention" className="scroll-mt-20">
        <AttentionPanel items={items} checkedAt={now} />
      </div>

      <section
        aria-label="At a glance"
        data-tour="tiles"
        className={
          compact ? 'grid gap-3 sm:grid-cols-3' : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
        }
      >
        <StatTile
          label="Services answering"
          value={up}
          iconTone="chart-1"
          footer={compact ? undefined : `of ${services.length} this app uses`}
          {...tile(<Activity aria-hidden />)}
        />
        <StatTile
          label="Webhook endpoints"
          value={webhooksCount}
          iconTone="chart-2"
          footer={
            compact
              ? undefined
              : webhooks.state === 'ok' || webhooks.state === 'empty'
                ? 'Receiving platform events'
                : 'Not readable yet'
          }
          {...tile(<Radio aria-hidden />)}
        />
        <StatTile
          label="Your permissions"
          value={permissions}
          iconTone="chart-3"
          footer={compact ? undefined : rolesLabel}
          {...tile(<Shield aria-hidden />)}
        />
      </section>

      {managesAccess && <RecentPeople session={session} />}

      <Card data-tour="services">
        <CardHeader>
          <CardTitle>Services this app uses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table caption="Services this app uses">
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.name}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    {s.state === 'up' ? (
                      <Badge tone="success">Answering</Badge>
                    ) : s.state === 'down' ? (
                      <Badge tone="danger">Not answering</Badge>
                    ) : (
                      <Badge tone="warning">Not set up</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-text-muted">{s.detail}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

/**
 * The latest people to sign in, with their roles (ADR 0030). Only for people who manage access:
 * platform-api answers no one else. Loads and fails on its own, so the dashboard still shows.
 */
async function RecentPeople({ session }: { session: Session }) {
  let people;
  try {
    people = (await listPeople(session, {})).data.slice(0, 5);
  } catch (err) {
    return (
      <Alert tone="danger" title="Recent sign-ins couldn’t be loaded." data-tour="people">
        {problemText(err)} Check that platform-api is running at PLATFORM_API_URL, then reload.
      </Alert>
    );
  }
  return (
    <Card data-tour="people">
      <CardHeader
        actions={
          <Link href="/admin/users" className="text-sm font-medium underline">
            See all users
          </Link>
        }
      >
        <CardTitle>Signed in lately</CardTitle>
      </CardHeader>
      <CardContent>
        {people.length === 0 ? (
          // An icon, not an illustration: the greeting already has the page's one illustration.
          <EmptyState
            icon={<Users aria-hidden />}
            title="Nobody has signed in yet"
            description="People appear here after their first sign-in. Who may sign in is the app’s access policy, in the console’s App access."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {people.map((p) => {
              const name = p.name ?? p.email ?? p.user_id;
              return (
                <li key={p.user_id} className="flex flex-wrap items-center gap-3 py-3">
                  <Avatar name={name} decorative />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{name}</span>
                    <span className="truncate text-sm text-text-muted">
                      {p.email ? `${p.email} · ` : ''}Seen {seen.format(new Date(p.checked_at))}
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-1">
                    {!p.allowed && <Badge tone="warning">Not on the access policy</Badge>}
                    {p.roles.map((r) => (
                      <Badge key={r}>{r === 'owner' ? 'Owner' : r}</Badge>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
