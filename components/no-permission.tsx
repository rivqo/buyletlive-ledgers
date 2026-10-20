import { EmptyState } from '@bluebulb/ui';
import { ShieldOff } from 'lucide-react';

/** A page someone's roles don't allow: says which permission, and who can give it (UI rules). */
export function NoPermission({ permission, what }: { permission: string; what: string }) {
  return (
    <EmptyState
      icon={<ShieldOff aria-hidden />}
      title={`You can’t open ${what}`}
      description={`It needs the ${permission} permission, which none of your roles has. Ask one of this app’s admins to give you a role with it; it reaches you within a few minutes.`}
    />
  );
}
