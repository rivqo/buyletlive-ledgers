import type { Brand } from '@/lib/brand';

/**
 * The owner's logo, light and dark, or its name when it has none. Decorative next to the name
 * where both show; otherwise the name is its alt text.
 */
export function BrandLogo({
  brand,
  title,
  compact = false,
}: {
  brand: Brand;
  title: string;
  compact?: boolean;
}) {
  if (!brand.logoUrl) {
    return (
      <span className="font-display text-lg font-semibold">
        {compact ? title.slice(0, 1) : title}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- platform-api serves it, sized here */}
      <img
        src={brand.logoUrl}
        alt={compact ? brand.name : ''}
        className={compact ? 'h-7 w-7 object-contain' : 'h-7 w-auto max-w-32 object-contain'}
      />
      {!compact && <span className="sr-only">{title}</span>}
    </span>
  );
}
