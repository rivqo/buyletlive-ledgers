/**
 * Every page has a tour (ADR 0030). Fails when a page under app/(app) or the customer area,
 * app/(customer), has no entry in
 * lib/tours.ts, when a tour is for a page that doesn't exist, or when a step points at a
 * `data-tour` target that nothing on that page (or the shell) renders.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { SHELL_TARGETS, TOURS } from '../lib/tours.ts';

const root = join(import.meta.dirname, '..');
const appRoot = join(root, 'app');
/** The signed-in areas: staff pages and the customer area. Sign-in pages sit outside them. */
const areas = ['(app)', '(customer)'].map((g) => join(appRoot, g));
const problems: string[] = [];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

/** `app/(app)/admin/users/page.tsx` is the route `/admin/users`. Groups `(x)` don't count. */
function routeOf(file: string): string {
  const parts = relative(appRoot, file)
    .split(sep)
    .slice(0, -1)
    .filter((p) => !/^\(.*\)$/.test(p));
  return `/${parts.join('/')}`;
}

const targetsIn = (text: string) =>
  new Set([...text.matchAll(/data-tour="([^"]+)"/g)].map((m) => m[1]!));

// Targets components render can sit on any page that uses them.
const shared = new Set<string>([
  ...SHELL_TARGETS,
  ...walk(join(root, 'components')).flatMap((f) => [...targetsIn(readFileSync(f, 'utf8'))]),
]);

const pages = areas
  .filter((dir) => existsSync(dir))
  .flatMap(walk)
  .filter((f) => f.endsWith(`${sep}page.tsx`));
const routes = new Map(pages.map((f) => [routeOf(f), f]));

for (const [route, file] of routes) {
  if (route.includes('[')) continue; // A page per record shares its list's tour.
  const tour = TOURS[route];
  if (!tour) {
    problems.push(`${relative(root, file)} has no tour. Add one for "${route}" in lib/tours.ts.`);
    continue;
  }
  const here = targetsIn(readFileSync(file, 'utf8'));
  for (const step of tour.steps) {
    if (!here.has(step.target) && !shared.has(step.target)) {
      problems.push(
        `The tour of "${route}" points at data-tour="${step.target}", which ${relative(root, file)} doesn't render.`,
      );
    }
  }
}
for (const route of Object.keys(TOURS)) {
  if (!routes.has(route))
    problems.push(`lib/tours.ts has a tour for "${route}", which isn't a page.`);
}

if (problems.length) {
  console.error(problems.map((p) => `✗ ${p}`).join('\n'));
  process.exit(1);
}
console.log(`✓ ${routes.size} pages, each with a tour.`);
