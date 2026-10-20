'use client';

import { Plus, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  Alert,
  Button,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogTrigger,
  Field,
  Input,
  MultiSelect,
  Select,
  useToast,
} from '@bluebulb/ui';
import { giveRole, makeRole, takeRole, type Result } from '@/app/(app)/admin/actions';

/** A small form in a dialog; the error stays beside the form until it's fixed. */
function ActionDialog({
  trigger,
  title,
  description,
  submitLabel,
  done,
  action,
  children,
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  submitLabel: string;
  done: string;
  action: (f: FormData) => Promise<Result>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (pending) return;
        setOpen(o);
        setError(undefined);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={title} description={description}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            start(async () => {
              const r = await action(f);
              if (r.error !== undefined) return setError(r.error);
              setOpen(false);
              toast({ title: done, tone: 'success' });
              router.refresh();
            });
          }}
        >
          {error && <Alert tone="danger" title={error} />}
          {children}
          <div className="flex justify-end">
            <Button type="submit" loading={pending}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function GiveRoleButton({
  personId,
  name,
  roles,
}: {
  personId: string;
  name: string;
  roles: { key: string; name: string }[];
}) {
  return (
    <ActionDialog
      trigger={
        <Button size="sm" variant="ghost">
          <UserPlus aria-hidden /> Give role
        </Button>
      }
      title={`Give ${name} a role`}
      description="They get it at their next access check, within a few minutes."
      submitLabel="Give role"
      done="Role given"
      action={(f) => giveRole(String(f.get('role')), personId)}
    >
      <Field label="Role">
        <Select name="role" required>
          {roles.map((r) => (
            <option key={r.key} value={r.key}>
              {r.name}
            </option>
          ))}
        </Select>
      </Field>
    </ActionDialog>
  );
}

export function TakeRoleButton({ id, name, role }: { id: string; name: string; role: string }) {
  const router = useRouter();
  const toast = useToast();
  return (
    <ConfirmDialog
      trigger={
        <Button size="sm" variant="ghost">
          Take away {role}
        </Button>
      }
      title={`Take ${role} away from ${name}?`}
      description="They lose what it gives at their next access check. Give it again any time."
      confirmLabel="Take role away"
      onConfirm={async () => {
        const r = await takeRole(id);
        if (r.error !== undefined) throw new Error(r.error);
        toast({ title: 'Role taken away', tone: 'success' });
        router.refresh();
      }}
    />
  );
}

export function NewRoleButton({
  permissions,
}: {
  permissions: { key: string; description: string }[];
}) {
  const [idem, setIdem] = useState('');
  return (
    <ActionDialog
      trigger={
        <Button
          variant="secondary"
          data-tour="roles-new"
          onClick={() => setIdem(crypto.randomUUID())}
        >
          <Plus aria-hidden /> New role
        </Button>
      }
      title="New role"
      description="Bundle any of this app’s permissions. It needs no code change."
      submitLabel="Create role"
      done="Role created"
      action={(f) =>
        makeRole(
          {
            key: String(f.get('key') ?? ''),
            name: String(f.get('name') ?? ''),
            description: String(f.get('description') ?? '') || null,
            permissions: f.getAll('permissions').map(String),
          },
          idem,
        )
      }
    >
      <Field label="Name">
        <Input name="name" required maxLength={60} />
      </Field>
      <Field label="Key" hint="Lowercase letters, digits and dashes. It can’t change later.">
        <Input name="key" required pattern="[a-z][a-z0-9\-]{0,39}" autoComplete="off" />
      </Field>
      <Field label="Description" optional>
        <Input name="description" maxLength={200} />
      </Field>
      <MultiSelect
        name="permissions"
        label="Permissions"
        options={permissions.map((p) => ({
          value: p.key,
          label: p.key,
          description: p.description,
          group: p.key.split(':')[0],
        }))}
      />
    </ActionDialog>
  );
}
