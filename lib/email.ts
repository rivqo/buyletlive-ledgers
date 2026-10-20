import 'server-only';
import { createEmailClient } from '@bluebulb/email';
import type { BluebulbConfig } from './bluebulb';

/**
 * The comms-email client when `bluebulb.json` lists "email" and the launcher has set its key, or
 * null. Send with `client.POST('/v1/emails', { body })`; the client adds the idempotency key.
 */
export function emailClient(
  config: BluebulbConfig,
  env: Record<string, string | undefined>,
  fetchImpl?: typeof fetch,
) {
  if (!config.services.includes('email')) return null;
  if (!env.EMAIL_API_URL || !env.EMAIL_API_KEY) return null;
  return createEmailClient({
    baseUrl: env.EMAIL_API_URL,
    token: env.EMAIL_API_KEY,
    timeoutMs: 5_000,
    fetch: fetchImpl,
  });
}
