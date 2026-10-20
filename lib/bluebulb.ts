import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';

/** A named background. A custom picture is the brand's hero, uploaded on the company. */
const surfaceFillSchema = z.object({
  kind: z.enum(['brand', 'hero', 'surface', 'muted']),
});

/**
 * The one file a project is customised with. The launcher writes it; the template reads it.
 * Keep this file identical to the other template's copy; a service never sets `look`.
 */
export const bluebulbSchema = z.object({
  /** URL-safe project name. Also the service slug and the staff-auth cookie prefix (hyphens removed). */
  name: z.string().regex(/^[a-z][a-z0-9-]*$/),
  /** What people see in the header. */
  title: z.string().min(1),
  /** Company slug whose brand colors to apply. An unknown slug keeps the platform palette. */
  sbu: z.string().min(1),
  /** Which generated clients this project calls. */
  services: z.array(z.enum(['platform', 'email'])).default([]),
  /** Set by the launcher once the platform exists. */
  platformId: z.string().optional(),
  /** The `app` key for access and roles (ADR 0030). Defaults to the name's letters. */
  app: z
    .string()
    .regex(/^[a-z]{2,40}$/)
    .optional(),
  /** How the platform splits its data (ADR 0029). `per_company` and `customers` act for a tenant. */
  tenancy: z.enum(['shared', 'per_company', 'customers']).default('shared'),
  /** Outside customers sign in to the app's customer area (ADR 0030). Apps only. */
  customers: z.boolean().default(false),
  /** Overrides the SBU brand's shape, surface and illustration. Colors stay with the brand. */
  style: z
    .object({
      shape: z.enum(['sharp', 'soft', 'round']).optional(),
      surface: z.enum(['bordered', 'raised', 'flat']).optional(),
      illustration: z.enum(['brand', 'muted']).optional(),
    })
    .optional(),
  /**
   * How this app looks (ADR 0024, 0030): sign-in layout, chrome, fonts and dashboard density.
   * Named fills only: brand, hero (the brand's hero picture), surface or muted.
   */
  look: z
    .object({
      sign_in: z
        .object({
          layout: z.enum(['centered', 'split', 'minimal']).optional(),
          show_logo: z.boolean().optional(),
          panel: surfaceFillSchema.optional(),
          brand_panel: surfaceFillSchema.optional(),
        })
        .optional(),
      chrome: z
        .object({
          placement: z.enum(['sidebar', 'navbar']).optional(),
          tone: z.enum(['surface', 'brand', 'dark']).optional(),
          background: surfaceFillSchema.optional(),
        })
        .optional(),
      fonts: z
        .object({
          body: z.string().min(1).max(60).optional(),
          display: z.string().min(1).max(60).optional(),
        })
        .optional(),
      dashboard: z
        .object({
          greeting: z.enum(['hero', 'full', 'compact', 'hidden']).optional(),
          tiles: z.enum(['stat', 'icon', 'compact']).optional(),
        })
        .optional(),
    })
    .optional(),
  /** Bumped when the template changes. `pnpm bluebulb:update` reports it and does not rewrite files. */
  templateVersion: z.number().int().positive(),
});

export type BluebulbConfig = z.infer<typeof bluebulbSchema>;

/** Reads `bluebulb.json` from the project root. Fails at startup when the file is wrong. */
export function readBluebulb(cwd = process.cwd()): BluebulbConfig {
  const raw = readFileSync(join(cwd, 'bluebulb.json'), 'utf8');
  return bluebulbSchema.parse(JSON.parse(raw));
}

/** staff-auth cookie names are letters only, so `hr-portal` becomes `hrportal`. */
export function cookieApp(name: string): string {
  const letters = name.replace(/[^a-z]/g, '');
  if (!letters) throw new Error(`bluebulb.json name "${name}" has no letters for a cookie prefix.`);
  return letters;
}

/** The key staff-auth and platform-api know this app by: `app`, else the name's letters. */
export function appKeyOf(config: Pick<BluebulbConfig, 'app' | 'name'>): string {
  return config.app ?? cookieApp(config.name);
}

/** What `pnpm bluebulb:update` prints. Rewriting a project that has its own code is a later step. */
export function updateMessage(config: BluebulbConfig): string {
  return `${config.title} is on template version ${config.templateVersion}. This command does not change files. Bringing newer template changes into an existing project comes later.`;
}
