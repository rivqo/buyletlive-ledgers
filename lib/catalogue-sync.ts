import { createPlatformClient } from '@bluebulb/platform';
import type { Catalogue } from '@bluebulb/core';

/**
 * Sends this app's permissions and roles to platform-api on start (ADR 0030), with the app's own
 * platform key (scope `platform:access:write`). Without a key it says so and carries on: an admin
 * can still send it, and owners hold every permission meanwhile. Never logs the key.
 */
export async function syncCatalogue(
  app: string,
  catalogue: Catalogue,
  env: Record<string, string | undefined>,
  log: (line: string) => void = console.log,
  fetchImpl?: typeof fetch,
): Promise<'synced' | 'skipped' | 'failed'> {
  if (!env.PLATFORM_API_URL || !env.PLATFORM_API_KEY) {
    log(
      `[roles] Not sent: set PLATFORM_API_URL and PLATFORM_API_KEY so ${app}'s roles reach platform-api.`,
    );
    return 'skipped';
  }
  try {
    await createPlatformClient({
      baseUrl: env.PLATFORM_API_URL,
      token: env.PLATFORM_API_KEY,
      timeoutMs: 5_000,
      fetch: fetchImpl,
    }).PUT('/v1/access/catalogue', {
      body: {
        app,
        permissions: [...catalogue.permissions],
        roles: catalogue.roles.map((r) => ({ ...r, permissions: [...r.permissions] })),
        default_role: catalogue.defaultRole,
      },
    });
    log(
      `[roles] Sent ${catalogue.permissions.length} permissions and ${catalogue.roles.length} roles for ${app}.`,
    );
    return 'synced';
  } catch (err) {
    log(`[roles] Not sent: ${err instanceof Error ? err.message : 'platform-api refused it.'}`);
    return 'failed';
  }
}
