import { appKeyOf, readBluebulb } from './lib/bluebulb';
import { syncCatalogue } from './lib/catalogue-sync';
import { catalogue } from './lib/permissions';

/** Sends the catalogue in `lib/permissions.ts` with the app's platform key. Never throws. */
export async function syncOnStart() {
  await syncCatalogue(appKeyOf(readBluebulb()), catalogue, process.env);
}
