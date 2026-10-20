/**
 * The docs check this project can run alone (the platform's docs app runs a stricter one when it
 * shows these pages): every Markdown link to a file goes somewhere, each `docs/*.mdx` page has a
 * title and description, `docs/meta.yaml` lists only pages that exist, and the quickstart and
 * the spec it names are there.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const root = join(import.meta.dirname, '..');
const problems: string[] = [];
const SKIP = new Set(['node_modules', 'dist', '.next', '.git', 'migrations']);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    // docs/platform is a copy of the platform repo's AGENTS.md; its links point into that repo.
    if (SKIP.has(name) || relative(root, path) === join('docs', 'platform')) return [];
    if (statSync(path).isDirectory()) return walk(path);
    return /\.mdx?$/.test(name) ? [path] : [];
  });
}

for (const file of walk(root)) {
  const text = readFileSync(file, 'utf8')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\n]*`/g, '');
  for (const [, href] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (!href || /^[a-z]+:/i.test(href) || href.startsWith('#') || href.startsWith('/')) continue;
    const target = join(dirname(file), href.split('#')[0] ?? '');
    if (!existsSync(target)) problems.push(`${relative(root, file)}: ${href} goes nowhere.`);
  }
}

const docs = join(root, 'docs');
const meta = existsSync(join(docs, 'meta.yaml'))
  ? readFileSync(join(docs, 'meta.yaml'), 'utf8')
  : '';
if (meta) {
  const pages = readdirSync(docs)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.slice(0, -4));
  for (const page of pages) {
    const head = /^---\n([\s\S]*?)\n---/.exec(readFileSync(join(docs, `${page}.mdx`), 'utf8'))?.[1];
    if (!head || !/^title: \S/m.test(head) || !/^description: \S/m.test(head)) {
      problems.push(`docs/${page}.mdx: needs a title and a description in its frontmatter.`);
    }
  }
  const listed =
    /^pages:\s*\[(.*)\]$/m
      .exec(meta)?.[1]
      ?.split(',')
      .map((p) => p.trim()) ?? [];
  for (const page of listed) {
    if (page && !pages.includes(page))
      problems.push(`docs/meta.yaml: lists ${page}, which has no .mdx file.`);
  }
  if (!pages.includes('quickstart'))
    problems.push('docs/quickstart.mdx: a service needs a quickstart.');
  const spec = /^spec:\s*(.+)$/m.exec(meta)?.[1];
  if (!spec || !existsSync(join(docs, spec)))
    problems.push('docs/meta.yaml: `spec` must name the openapi.yaml.');
}

if (problems.length > 0) {
  for (const problem of problems) console.error(problem);
  process.exit(1);
}
console.log('docs check passed');
