import type { Metadata } from 'next';
import Link from 'next/link';
import { Users } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  CursorPagination,
  EmptyState,
  Field,
  PageHeader,
  SearchInput,
  Select,
  StatTile,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  pageLinks,
  type PageState,
} from '@bluebulb/ui';
import { GiveRoleButton, TakeRoleButton } from '@/components/admin-controls';
import { NoPermission } from '@/components/no-permission';
import { listPeople, listRoles, problemText } from '@/lib/access';
import { auth } from '@/lib/auth';
import { P } from '@/lib/permissions';

export const metadata: Metadata = { title: 'Users' };
export const dynamic = 'force-dynamic';

/** Everyone who has signed in, with their roles; admins give and take roles here (ADR 0030). */
export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<PageState & { q?: string; role?: string }>;
}) {
  const session = await auth.requireSession();
  if (!auth.can(session, P.accessManage)) {
    return <NoPermission permission={P.accessManage} what="the users page" />;
  }
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  let people, roles;
  try {
    [people, roles] = await Promise.all([
      listPeople(session, { q, role: sp.role, cursor: sp.cursor }),
      listRoles(session),
    ]);
  } catch (err) {
    return (
      <>
        <PageHeader title="Users" />
        <Alert tone="danger" title="Users couldn’t be loaded.">
          {problemText(err)} Check that platform-api is running at PLATFORM_API_URL, then reload.
        </Alert>
      </>
    );
  }
  const role = roles.find((r) => r.key === sp.role)?.key;
  const links = pageLinks('/admin/users', { q, role }, sp, people.next_cursor);
  const named = roles.reduce((n, r) => n + r.assignments, 0);
  const roleName = new Map(roles.map((r) => [r.key, r.name]));

  return (
    <>
      <PageHeader
        title="Users"
        description="Everyone who has signed in to this app, with the roles they had at their last sign-in. Roles you give reach people within a few minutes."
      />
      <section
        aria-label="Users at a glance"
        data-tour="users-tiles"
        className="grid gap-4 sm:grid-cols-3"
      >
        <StatTile
          label="On this page"
          value={people.data.length}
          animate={false}
          footer="Newest sign-in first"
        />
        <StatTile
          label="Roles"
          value={roles.length}
          animate={false}
          footer="From the code, or made here"
        />
        <StatTile
          label="Roles given by name"
          value={named}
          animate={false}
          footer="To people, groups, companies and departments"
        />
      </section>
      <form data-tour="users-filters" className="flex flex-wrap items-end gap-3" method="get">
        <Field label="Search" className="min-w-56 flex-1">
          <SearchInput name="q" defaultValue={q} placeholder="Name or email" />
        </Field>
        <Field label="Role" className="w-48">
          <Select name="role" defaultValue={role ?? ''}>
            <option value="">Any</option>
            {roles.map((r) => (
              <option key={r.key} value={r.key}>
                {r.name}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>
      {people.data.length === 0 ? (
        q || role ? (
          <EmptyState
            icon={<Users aria-hidden />}
            title="Nobody matches these filters"
            description="Clear the filters to see everyone who has signed in."
            action={
              <Link href="/admin/users" className="text-sm font-medium underline">
                Clear filters
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={<Users aria-hidden />}
            title="Nobody has signed in yet"
            description="People appear here after their first sign-in. Who may sign in is the app’s access policy, in the console’s App access."
          />
        )
      ) : (
        <div data-tour="users-table">
          <Table caption="Users" className="min-w-[40rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Who</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {people.data.map((p) => {
                const name = p.name ?? p.email ?? p.user_id;
                return (
                  <TableRow key={p.user_id}>
                    <TableCell className="align-top">
                      <span className="font-medium">{name}</span>
                      {p.email && <span className="block text-sm text-text-muted">{p.email}</span>}
                      {!p.allowed && <Badge tone="warning">Not on the access policy</Badge>}
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex flex-wrap gap-1">
                        {p.roles.length ? (
                          p.roles.map((r) => (
                            <Badge key={r}>
                              {r === 'owner' ? 'Owner' : (roleName.get(r) ?? r)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-text-muted">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-right">
                      <div className="flex flex-wrap justify-end gap-1">
                        {p.assignments.map((a) => (
                          <TakeRoleButton
                            key={a.id}
                            id={a.id}
                            name={name}
                            role={roleName.get(a.role_key) ?? a.role_key}
                          />
                        ))}
                        {p.person_id && roles.length > 0 && (
                          <GiveRoleButton personId={p.person_id} name={name} roles={roles} />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
      {(people.next_cursor || sp.cursor) && (
        <CursorPagination
          linkAs={Link}
          summary={`Page ${links.page}, newest sign-in first`}
          nextHref={links.nextHref}
          prevHref={links.prevHref}
        />
      )}
    </>
  );
}
