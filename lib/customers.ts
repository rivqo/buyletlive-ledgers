import 'server-only';
import { customerAuth } from '@bluebulb/staff-auth/server';
import type { NextRequest } from 'next/server';
import { projectConfig } from './auth';
import { appKeyOf } from './bluebulb';

/**
 * The customer area (ADR 0030): outside customers sign in with their email, in the platform's
 * customer organisation, and hold one role, `customer`, with this app's `customer:` permissions.
 * It's on when bluebulb.json says `"customers": true`; otherwise every path under it is a 404.
 * Gate customer actions with `customers.requirePermission(P.customer…)`, and scope every record
 * to `session.sub`: a customer's data is theirs.
 */
export const CUSTOMER_BASE = '/account';

export const customers = customerAuth({
  app: appKeyOf(projectConfig),
  basePath: CUSTOMER_BASE,
  // Signed-out customers see the area's own branded page first (app/account/signed-out).
  signInPage: `${CUSTOMER_BASE}/signed-out`,
});

export const customersOn = projectConfig.customers;

/** Whether a path is in the customer area. */
export const inCustomerArea = (path: string) =>
  path === CUSTOMER_BASE || path.startsWith(`${CUSTOMER_BASE}/`);

/** A route handler that exists only while the customer area is on. */
export function customerRoute(handler: (req: NextRequest) => Promise<Response>) {
  return (req: NextRequest) =>
    customersOn ? handler(req) : Promise.resolve(new Response('Not found', { status: 404 }));
}
