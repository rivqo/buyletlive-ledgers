import 'server-only';
import { ApiError, createPlatformClient, type components } from '@bluebulb/platform';
import type { BluebulbConfig } from './bluebulb';

export type WebhookRow = Pick<components['schemas']['WebhookEndpoint'], 'id' | 'url'>;

/** The scope this page's call needs. The 403 copy names it so people know what to ask for. */
export const WEBHOOKS_READ_SCOPE = 'platform:webhooks:read';

export type WebhookView =
  | { state: 'unconfigured' }
  | { state: 'no-key' }
  | { state: 'empty' }
  | { state: 'ok'; endpoints: WebhookRow[] }
  | { state: 'forbidden'; scope: string }
  | { state: 'error'; message: string };

/** A slow platform-api should fail this page quickly, not hold it open. */
const TIMEOUT_MS = 5_000;

/**
 * Lists the platform's webhook endpoints through `@bluebulb/platform`. Server only: the key
 * arrives from the environment (the launcher sets it) and never reaches the browser.
 */
export async function loadWebhooks(
  config: BluebulbConfig,
  env: Record<string, string | undefined>,
  fetchImpl?: typeof fetch,
): Promise<WebhookView> {
  if (!config.services.includes('platform')) return { state: 'unconfigured' };
  if (!env.PLATFORM_API_URL || !env.PLATFORM_API_KEY) return { state: 'no-key' };
  try {
    const platform = createPlatformClient({
      baseUrl: env.PLATFORM_API_URL,
      token: env.PLATFORM_API_KEY,
      timeoutMs: TIMEOUT_MS,
      maxRetries: 1,
      fetch: fetchImpl,
    });
    const { data } = await platform.GET('/v1/webhook-endpoints');
    const endpoints = data.data.map(({ id, url }) => ({ id, url }));
    if (endpoints.length === 0) return { state: 'empty' };
    return { state: 'ok', endpoints };
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      return { state: 'forbidden', scope: WEBHOOKS_READ_SCOPE };
    }
    if (err instanceof Error && err.name === 'TimeoutError') {
      return {
        state: 'error',
        message: `platform-api did not answer within ${TIMEOUT_MS / 1000}s.`,
      };
    }
    const message = err instanceof Error ? err.message : 'The request failed.';
    return { state: 'error', message };
  }
}
