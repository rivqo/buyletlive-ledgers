import { allows } from '@bluebulb/staff-auth';
import { P } from './permissions';

/*
 * The app's menu (ADR 0030): sections of pages, each naming the permission it needs. The layout
 * hides what a person can't open; the page checks again with `requirePermission`. Icons are
 * lucide names, resolved in `components/app-frame.tsx`.
 */

export type IconName = 'dashboard' | 'users' | 'roles' | 'design' | 'help' | 'details' | 'intents';

export interface NavPage {
  href: string;
  label: string;
  icon: IconName;
  permission: string;
}

export interface NavGroup {
  label?: string;
  pages: NavPage[];
}

export const NAV: NavGroup[] = [
  { pages: [{ href: '/', label: 'Dashboard', icon: 'dashboard', permission: P.dashboardView }] },
  {
    label: 'Admin',
    pages: [
      { href: '/admin/users', label: 'Users', icon: 'users', permission: P.accessManage },
      { href: '/admin/roles', label: 'Roles', icon: 'roles', permission: P.accessManage },
      { href: '/design', label: 'Design', icon: 'design', permission: P.designView },
    ],
  },
  {
    label: 'Support',
    pages: [{ href: '/help', label: 'Help', icon: 'help', permission: P.helpView }],
  },
];

/** The customer area's menu (ADR 0030): only `customer:` permissions, which only customers hold. */
export const CUSTOMER_NAV: NavGroup[] = [
  {
    pages: [
      {
        href: '/account',
        label: 'Your details',
        icon: 'details',
        permission: P.customerDetailsEdit,
      },
      {
        href: '/account/intents',
        label: 'Register an intent',
        icon: 'intents',
        permission: P.customerIntentCreate,
      },
    ],
  },
];

/** The menu this person may see: pages they hold the permission for, empty groups dropped. */
export function navFor(permissions: readonly string[], nav: NavGroup[] = NAV): NavGroup[] {
  return nav
    .map((g) => ({ ...g, pages: g.pages.filter((p) => allows(permissions, p.permission)) }))
    .filter((g) => g.pages.length > 0);
}
