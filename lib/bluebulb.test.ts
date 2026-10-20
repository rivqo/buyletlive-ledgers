import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { describe, expect, it, vi } from 'vitest';
import { cookieApp, readBluebulb, updateMessage } from './bluebulb';
import { emailClient } from './email';
import { WEBHOOKS_READ_SCOPE, loadWebhooks } from './platform';

// `server-only` throws outside a React server build; these modules are server code under test.
vi.mock('server-only', () => ({}));

describe('bluebulb.json', () => {
  it('reads the project file and derives a letter-only cookie prefix', () => {
    const config = readBluebulb();
    expect(config.name).toMatch(/^[a-z]/);
    expect(cookieApp('hr-portal')).toBe('hrportal');
    expect(updateMessage(config)).toContain(`template version ${config.templateVersion}`);
    expect(updateMessage(config)).toContain('does not change files');
  });
});

describe('loadWebhooks', () => {
  it('lists endpoints through the platform SDK', async () => {
    const server = createServer((_req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify({
          data: [{ id: 'whe_1', url: 'https://example.com/hooks' }],
          next_cursor: null,
        }),
      );
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address() as AddressInfo;
    try {
      const view = await loadWebhooks(
        { ...readBluebulb(), services: ['platform'] },
        { PLATFORM_API_URL: `http://127.0.0.1:${port}`, PLATFORM_API_KEY: 'bb_test_example' },
      );
      expect(view.state).toBe('ok');
      if (view.state === 'ok') expect(view.endpoints[0]?.url).toBe('https://example.com/hooks');
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('says when the launcher has not set a key', async () => {
    const view = await loadWebhooks({ ...readBluebulb(), services: ['platform'] }, {});
    expect(view.state).toBe('no-key');
  });

  it('names the missing scope when the key is refused', async () => {
    const server = createServer((_req, res) => {
      res.writeHead(403, { 'content-type': 'application/problem+json' });
      res.end(
        JSON.stringify({
          type: 'https://docs.bluebulb.internal/errors/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: 'This key does not have the required scope.',
        }),
      );
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address() as AddressInfo;
    try {
      const view = await loadWebhooks(
        { ...readBluebulb(), services: ['platform'] },
        { PLATFORM_API_URL: `http://127.0.0.1:${port}`, PLATFORM_API_KEY: 'bb_test_example' },
      );
      expect(view).toEqual({ state: 'forbidden', scope: WEBHOOKS_READ_SCOPE });
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('says so when platform-api does not answer in time', async () => {
    // sdk-core's own tests cover the timer; this checks what the page is told.
    const timedOut = (async () => {
      throw new DOMException('The operation timed out.', 'TimeoutError');
    }) as typeof fetch;
    const view = await loadWebhooks(
      { ...readBluebulb(), services: ['platform'] },
      { PLATFORM_API_URL: 'http://platform.test', PLATFORM_API_KEY: 'bb_test_example' },
      timedOut,
    );
    expect(view).toEqual({ state: 'error', message: 'platform-api did not answer within 5s.' });
  });
});

describe('emailClient', () => {
  it('is only made when bluebulb.json lists email and its key is set', () => {
    const env = { EMAIL_API_URL: 'http://email.test', EMAIL_API_KEY: 'bb_test_example' };
    expect(emailClient({ ...readBluebulb(), services: ['platform'] }, env)).toBeNull();
    expect(emailClient({ ...readBluebulb(), services: ['email'] }, {})).toBeNull();
    expect(emailClient({ ...readBluebulb(), services: ['email'] }, env)).not.toBeNull();
  });
});
