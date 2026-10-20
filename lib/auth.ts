import 'server-only';
import { staffAuth } from '@bluebulb/staff-auth/server';
import { appKeyOf, readBluebulb } from './bluebulb';

const project = readBluebulb();

/**
 * Staff sign in through Zitadel and see our login screens (ADR 0015). Who may use the app is its
 * access policy in platform-api (ADR 0018), and what they may do in it is their roles (ADR 0030):
 * gate with `auth.requirePermission()`. No platform role is needed; that's for the platform's own
 * tools.
 */
// Signed-out people see the app's own branded page first (app/signed-out).
export const auth = staffAuth({ app: appKeyOf(project), signInPage: '/signed-out' });
export const projectConfig = project;
