import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { customers, customersOn, inCustomerArea } from '@/lib/customers';

/** Staff pages use the staff sign-in; the customer area (ADR 0030) its own, when it's on. */
export async function middleware(req: NextRequest) {
  if (inCustomerArea(req.nextUrl.pathname)) {
    if (!customersOn) return new Response('Not found', { status: 404 });
    return customers.middleware(req);
  }
  return auth.middleware(req);
}

export const config = {
  runtime: 'nodejs',
  // Health is public so a deploy can check the process without a session; so are both sign-ins.
  matcher: [
    '/((?!auth/|signed-out|account/auth/|account/signed-out|healthz|_next/|favicon\\.ico).*)',
  ],
};
