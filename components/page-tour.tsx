'use client';

import { Compass } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Tour } from '@bluebulb/ui';
import { TOURS } from '@/lib/tours';

/**
 * "Tour" in the top bar: walks the current page (ADR 0030). Opens by itself when the help centre
 * links here with `?tour=1`, and drops that from the address when it ends.
 */
export function PageTour({ path }: { path: string }) {
  const tour = TOURS[path];
  const params = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (tour && params.get('tour') === '1') setOpen(true);
  }, [tour, params]);

  if (!tour) return null;
  const change = (next: boolean) => {
    setOpen(next);
    if (!next && params.get('tour')) router.replace(path, { scroll: false });
  };
  return (
    <>
      <Button variant="ghost" size="sm" data-tour="tour-button" onClick={() => setOpen(true)}>
        <Compass aria-hidden /> Tour
      </Button>
      <Tour
        label={`Tour of ${tour.title.toLowerCase()}`}
        steps={tour.steps}
        open={open}
        onOpenChange={change}
      />
    </>
  );
}
