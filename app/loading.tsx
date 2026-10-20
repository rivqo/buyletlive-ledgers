import { Skeleton } from '@bluebulb/ui';

export default function Loading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
