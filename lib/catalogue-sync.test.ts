import { describe, expect, it } from 'vitest';
import { syncCatalogue } from './catalogue-sync';
import { catalogue } from './permissions';

describe('syncCatalogue', () => {
  it('says what to set, and sends nothing, without a key', async () => {
    const lines: string[] = [];
    expect(await syncCatalogue('sample', catalogue, {}, (l) => lines.push(l))).toBe('skipped');
    expect(lines[0]).toMatch(/set PLATFORM_API_URL and PLATFORM_API_KEY/);
  });

  it('sends the catalogue for this app with its key, and never logs the key', async () => {
    const lines: string[] = [];
    let sent: { url: string; auth: string | null; body: Record<string, unknown> } | undefined;
    const fake: typeof fetch = async (input, init) => {
      const req = input instanceof Request ? input : new Request(input, init);
      sent = { url: req.url, auth: req.headers.get('authorization'), body: await req.json() };
      return Response.json({ permissions: [], roles: [], default_role: 'member', synced_at: null });
    };
    const result = await syncCatalogue(
      'sample',
      catalogue,
      { PLATFORM_API_URL: 'http://platform.test', PLATFORM_API_KEY: 'bb_test_secret' },
      (l) => lines.push(l),
      fake,
    );
    expect(result).toBe('synced');
    expect(sent?.url).toBe('http://platform.test/v1/access/catalogue');
    expect(sent?.auth).toBe('Bearer bb_test_secret');
    expect(sent?.body).toMatchObject({ app: 'sample', default_role: 'member' });
    expect(lines.join('\n')).not.toContain('bb_test_secret');
  });

  it('reports a refusal without failing the start', async () => {
    const fake: typeof fetch = async () =>
      Response.json(
        { status: 404, title: 'App not found' },
        { status: 404, headers: { 'content-type': 'application/problem+json' } },
      );
    const lines: string[] = [];
    expect(
      await syncCatalogue(
        'sample',
        catalogue,
        { PLATFORM_API_URL: 'http://p.test', PLATFORM_API_KEY: 'k' },
        (l) => lines.push(l),
        fake,
      ),
    ).toBe('failed');
    expect(lines[0]).toMatch(/^\[roles\] Not sent/);
  });
});
