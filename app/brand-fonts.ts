import {
  Boldonse,
  Cormorant_Garamond,
  DM_Sans,
  Figtree,
  Fraunces,
  IBM_Plex_Sans,
  Inter,
  Libre_Baskerville,
  Lora,
  Manrope,
  Nunito_Sans,
  Outfit,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Source_Sans_3,
  Source_Serif_4,
  Space_Grotesk,
  Urbanist,
  Work_Sans,
} from 'next/font/google';

/**
 * Self-hosted copies of `brandFonts` (packages/tokens/src/fonts.ts), so a brand's chosen face
 * loads instead of falling back. next/font only runs in app code, so the console, the login and
 * the app template each keep this file; `pnpm check:standards` fails when the copies differ or
 * miss a face. Each call is its own const because next/font rejects a loader that isn't assigned
 * at module scope. Each `variable` is `--bb-font-face-<slug>` and the weights match the catalog.
 * `preload: false` so a page does not fetch every face; the browser fetches the ones in use.
 */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['400', '500', '600', '700'],
  variable: '--bb-font-face-inter',
});
const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['400', '500', '600', '700'],
  variable: '--bb-font-face-source-sans-3',
});
const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['400', '500', '600', '700'],
  variable: '--bb-font-face-dm-sans',
});
const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['400', '500', '600', '700'],
  variable: '--bb-font-face-outfit',
});
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['400', '500', '600', '700'],
  variable: '--bb-font-face-ibm-plex-sans',
});
const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['400', '500', '600', '700'],
  variable: '--bb-font-face-nunito-sans',
});
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['400', '500', '600', '700'],
  variable: '--bb-font-face-plus-jakarta-sans',
});
const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['400', '500', '600', '700'],
  variable: '--bb-font-face-manrope',
});
const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['400', '500', '600', '700'],
  variable: '--bb-font-face-figtree',
});
const workSans = Work_Sans({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['400', '500', '600', '700'],
  variable: '--bb-font-face-work-sans',
});
const urbanist = Urbanist({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['400', '500', '600', '700'],
  variable: '--bb-font-face-urbanist',
});
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['400', '500', '600', '700'],
  variable: '--bb-font-face-space-grotesk',
});
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['500', '600', '700'],
  variable: '--bb-font-face-playfair-display',
});
const boldonse = Boldonse({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  // Next has no size-adjust metrics for this face, and looking them up logs an error.
  adjustFontFallback: false,
  weight: '400',
  variable: '--bb-font-face-boldonse',
});
const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['400', '500', '600', '700'],
  variable: '--bb-font-face-cormorant-garamond',
});
const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['500', '600', '700'],
  variable: '--bb-font-face-fraunces',
});
const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['400', '700'],
  variable: '--bb-font-face-libre-baskerville',
});
const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['400', '500', '600', '700'],
  variable: '--bb-font-face-lora',
});
const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  weight: ['400', '600', '700'],
  variable: '--bb-font-face-source-serif-4',
});

export const brandFontClassName = [
  inter,
  sourceSans3,
  dmSans,
  outfit,
  ibmPlexSans,
  nunitoSans,
  plusJakartaSans,
  manrope,
  figtree,
  workSans,
  urbanist,
  spaceGrotesk,
  playfairDisplay,
  boldonse,
  cormorantGaramond,
  fraunces,
  libreBaskerville,
  lora,
  sourceSerif4,
]
  .map((face) => face.variable)
  .join(' ');
