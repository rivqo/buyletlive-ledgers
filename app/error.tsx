'use client';

import { Alert, Button } from '@bluebulb/ui';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6">
      <Alert
        tone="danger"
        title="This page failed"
        action={
          <Button type="button" variant="secondary" onClick={reset}>
            Try again
          </Button>
        }
      >
        Reload the page. If it keeps happening, tell the platform team when it failed.
      </Alert>
    </div>
  );
}
