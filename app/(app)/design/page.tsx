import type { Metadata } from 'next';
import { DesignGallery } from '@bluebulb/ui/gallery';
import { NoPermission } from '@/components/no-permission';
import { auth } from '@/lib/auth';
import { P } from '@/lib/permissions';

export const metadata: Metadata = { title: 'Design' };
export const dynamic = 'force-dynamic';

/**
 * Every token and component, in this app's brand (ADR 0030). Build new screens from what's here;
 * a pattern that isn't here belongs in @bluebulb/ui first.
 */
export default async function DesignPage() {
  const session = await auth.requireSession();
  if (!auth.can(session, P.designView)) {
    return <NoPermission permission={P.designView} what="the design page" />;
  }
  return (
    <div data-tour="design-gallery">
      <DesignGallery />
    </div>
  );
}
