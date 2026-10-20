import 'server-only';
import { ApiError, createPlatformClient, type components } from '@bluebulb/platform';
import type { Session } from '@bluebulb/staff-auth';
import { appKeyOf } from './bluebulb';
import { projectConfig } from './auth';

/*
 * This app's users and roles in platform-api (ADR 0030), read and changed as the signed-in person.
 * platform-api lets them through only when they hold `access:manage` here (or are a platform
 * admin), so these pages can't do more than the person may.
 */

export type AppPerson = components['schemas']['AppPerson'];
export type AppRole = components['schemas']['AppRole'];
export type AppCatalogue = components['schemas']['AppCatalogue'];

const app = appKeyOf(projectConfig);

function client(session: Session) {
  const baseUrl = process.env.ACCESS_API_URL ?? process.env.PLATFORM_API_URL;
  if (!baseUrl) {
    throw new Error('Set PLATFORM_API_URL so this app can read its users and roles.');
  }
  return createPlatformClient({
    baseUrl,
    token: session.accessToken,
    timeoutMs: 5_000,
    maxRetries: 1,
  });
}

/** platform-api's own words for a failure, which say what to fix. */
export function problemText(err: unknown): string {
  if (err instanceof ApiError) {
    return err.errors?.map((e) => e.message).join(' ') || err.detail || err.title;
  }
  return err instanceof Error ? err.message : 'The request failed.';
}

export async function listPeople(
  session: Session,
  q: { q?: string; role?: string; cursor?: string },
) {
  const { data } = await client(session).GET('/v1/access/apps/{key}/people', {
    params: { path: { key: app }, query: { ...q, limit: 25 } },
  });
  return data;
}

/** Every role (an app has a few). */
export async function listRoles(session: Session): Promise<AppRole[]> {
  const all: AppRole[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < 10; i++) {
    const { data } = await client(session).GET('/v1/access/apps/{key}/roles', {
      params: { path: { key: app }, query: { limit: 100, ...(cursor && { cursor }) } },
    });
    all.push(...data.data);
    if (!data.next_cursor) break;
    cursor = data.next_cursor;
  }
  return all;
}

export async function getCatalogue(session: Session): Promise<AppCatalogue> {
  const { data } = await client(session).GET('/v1/access/apps/{key}/catalogue', {
    params: { path: { key: app } },
  });
  return data;
}

export async function assignRole(session: Session, roleKey: string, subjectId: string) {
  await client(session).POST('/v1/access/apps/{key}/role-assignments', {
    params: { path: { key: app } },
    body: { role_key: roleKey, subject_id: subjectId },
  });
}

export async function unassignRole(session: Session, id: string) {
  await client(session).DELETE('/v1/access/apps/{key}/role-assignments/{id}', {
    params: { path: { key: app, id } },
  });
}

export async function createRole(
  session: Session,
  role: { key: string; name: string; description: string | null; permissions: string[] },
  idempotencyKey: string,
) {
  await client(session).POST('/v1/access/apps/{key}/roles', {
    params: { path: { key: app }, header: { 'Idempotency-Key': idempotencyKey } },
    body: role,
  });
}
