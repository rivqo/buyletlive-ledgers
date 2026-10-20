import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Alert,
  Badge,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@bluebulb/ui';
import { NewRoleButton } from '@/components/admin-controls';
import { NoPermission } from '@/components/no-permission';
import { getCatalogue, listRoles, problemText } from '@/lib/access';
import { auth } from '@/lib/auth';
import { P } from '@/lib/permissions';

export const metadata: Metadata = { title: 'Roles' };
export const dynamic = 'force-dynamic';

/** What each role allows, and the app's permissions (ADR 0030). Give roles on the Users page. */
export default async function RolesPage() {
  const session = await auth.requireSession();
  if (!auth.can(session, P.accessManage)) {
    return <NoPermission permission={P.accessManage} what="the roles page" />;
  }
  let roles, catalogue;
  try {
    [roles, catalogue] = await Promise.all([listRoles(session), getCatalogue(session)]);
  } catch (err) {
    return (
      <>
        <PageHeader title="Roles" />
        <Alert tone="danger" title="Roles couldn’t be loaded.">
          {problemText(err)} Check that platform-api is running at PLATFORM_API_URL, then reload.
        </Alert>
      </>
    );
  }
  return (
    <>
      <PageHeader
        title="Roles"
        description="What each role allows. Roles from this app’s code (permissions.ts) keep the code’s permissions; roles made here can bundle any of them."
        actions={<NewRoleButton permissions={catalogue.permissions} />}
      />
      {!catalogue.synced_at && (
        <Alert tone="warning" title="The app hasn’t sent its roles yet.">
          It sends them when it starts with its platform key (PLATFORM_API_KEY). Until then only its
          owners can do anything here.
        </Alert>
      )}
      <div data-tour="roles-table">
        <Table caption="Roles" className="min-w-[36rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Allows</TableHead>
              <TableHead>Held by name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((r) => (
              <TableRow key={r.key}>
                <TableCell className="align-top">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{r.name}</span>
                    <Badge>{r.source === 'catalogue' ? 'From code' : 'Made here'}</Badge>
                    {catalogue.default_role === r.key && <Badge tone="accent">Everyone</Badge>}
                  </div>
                  {r.description && <p className="text-sm text-text-muted">{r.description}</p>}
                </TableCell>
                <TableCell className="align-top font-mono text-xs">
                  {r.permissions.join(', ') || '—'}
                </TableCell>
                <TableCell className="align-top">
                  {r.assignments ? (
                    <Link
                      href={`/admin/users?role=${encodeURIComponent(r.key)}`}
                      className="underline"
                    >
                      {r.assignments}
                    </Link>
                  ) : (
                    <span className="text-text-muted">Nobody</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <section
        aria-labelledby="permissions"
        data-tour="permissions-table"
        className="flex flex-col gap-3"
      >
        <h2 id="permissions" className="text-base font-semibold">
          Permissions
        </h2>
        <Table caption="Permissions">
          <TableHeader>
            <TableRow>
              <TableHead>Permission</TableHead>
              <TableHead>What it allows</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {catalogue.permissions.map((p) => (
              <TableRow key={p.key}>
                <TableCell className="font-mono text-xs whitespace-nowrap">{p.key}</TableCell>
                <TableCell>{p.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </>
  );
}
