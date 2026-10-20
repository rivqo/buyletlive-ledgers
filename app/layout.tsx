import type { Metadata } from 'next';
import { Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import {
  THEME_COOKIE,
  ToastProvider,
  TooltipProvider,
  readThemePreference,
  themeAttributes,
} from '@bluebulb/ui';
import { projectConfig } from '@/lib/auth';
import { brandCss, loadBrand } from '@/lib/brand';
import { brandFontClassName } from './brand-fonts';
import './globals.css';

const sans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--bb-font-face-sans',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--bb-font-face-mono',
});

export const metadata: Metadata = {
  title: { default: projectConfig.title, template: `%s · ${projectConfig.title}` },
};

/** Every page, signed in or not, wears the owner's brand (ADR 0024, 0029). */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pref = readThemePreference((await cookies()).get(THEME_COOKIE)?.value);
  const brand = await loadBrand(projectConfig);
  return (
    <html
      lang="en"
      {...themeAttributes(pref)}
      className={`${sans.variable} ${mono.variable} ${brandFontClassName}`}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: brandCss(brand, projectConfig) }} />
      </head>
      <body>
        <TooltipProvider>
          <ToastProvider>{children}</ToastProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
