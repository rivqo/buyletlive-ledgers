/**
 * Runs once when the server starts: sends this app's roles to platform-api (ADR 0030). The
 * Node.js-only work is its own file, so the edge build never sees it.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { syncOnStart } = await import('./instrumentation.node');
    await syncOnStart();
  }
}
