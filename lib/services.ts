import 'server-only';
import type { BluebulbConfig } from './bluebulb';

/*
 * The platform services this app depends on and whether each answered just now, for the
 * dashboard (ADR 0010: is anything wrong, in five seconds).
 */

export interface ServiceHealth {
  name: string;
  url: string | null;
  state: 'up' | 'down' | 'not-set';
  detail: string;
}

async function ready(name: string, base: string | undefined): Promise<ServiceHealth> {
  if (!base)
    return { name, url: null, state: 'not-set', detail: 'Its address isn’t set for this app.' };
  const url = base.replace(/\/$/, '');
  try {
    const res = await fetch(`${url}/readyz`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2_000),
    });
    return res.ok
      ? { name, url, state: 'up', detail: 'Answered just now.' }
      : { name, url, state: 'down', detail: `Answered ${res.status}.` };
  } catch {
    return { name, url, state: 'down', detail: 'Didn’t answer within 2 seconds.' };
  }
}

/** platform-api always (sign-in, access, roles); email when bluebulb.json lists it. */
export function checkServices(
  config: BluebulbConfig,
  env: Record<string, string | undefined> = process.env,
): Promise<ServiceHealth[]> {
  return Promise.all([
    ready('platform-api', env.PLATFORM_API_URL),
    ...(config.services.includes('email') ? [ready('comms-email', env.EMAIL_API_URL)] : []),
  ]);
}
