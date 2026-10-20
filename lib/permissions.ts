// Types only: this file is read by pages and the start-up hook, so it stays free of server code.
import type { Catalogue } from '@bluebulb/core';

/*
 * What can be done in this app, and the roles it starts with (ADR 0030). The app sends this to
 * platform-api when it starts (`instrumentation.ts`); admins then give roles to people, groups,
 * companies or departments on the Roles and Users pages, or add their own roles without a deploy.
 *
 * Add a permission for every action or area you gate, named `area:action`, with a sentence saying
 * what it allows. Gate it on the server with `auth.requirePermission(P.x)` and name the same
 * permission on its nav item or control. Owners always hold everything.
 */

export const P = {
  dashboardView: 'dashboard:view',
  designView: 'design:view',
  helpView: 'help:view',
  /** Built in to every app (`ACCESS_MANAGE` in @bluebulb/core): change who holds which role. */
  accessManage: 'access:manage',
  /**
   * The customer area's (ADR 0030). Every `customer:` permission declared here goes to the fixed
   * `customer` role and to nobody else; no staff role may name one.
   */
  customerDetailsEdit: 'customer:details-edit',
  customerIntentCreate: 'customer:intent-create',
} as const;

export const catalogue: Catalogue = {
  permissions: [
    { key: P.dashboardView, description: 'See the dashboard.' },
    {
      key: P.designView,
      description: 'See the design page: the tokens and components to build with.',
    },
    { key: P.helpView, description: 'Open the help centre and its tours.' },
    {
      key: P.customerDetailsEdit,
      description: 'Customers: see and change their own details.',
    },
    {
      key: P.customerIntentCreate,
      description: 'Customers: register an intent and see the ones they registered.',
    },
  ],
  roles: [
    {
      key: 'admin',
      name: 'Admin',
      description: 'Everything, including who holds which role.',
      permissions: [P.dashboardView, P.designView, P.helpView, P.accessManage],
    },
    {
      key: 'member',
      name: 'Member',
      description: 'Uses the app day to day.',
      permissions: [P.dashboardView, P.helpView],
    },
  ],
  // Everyone the access policy lets in starts as a member.
  defaultRole: 'member',
};
