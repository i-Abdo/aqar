'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div dir="rtl" className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
          <h2 className="text-2xl font-bold font-headline text-destructive mb-4">حدث خطأ غير متوقع!</h2>
          <p className="text-muted-foreground mb-6">
            نأسف، لقد واجه التطبيق مشكلة. لقد تم إبلاغ فريقنا.
          </p>
          <Button onClick={() => reset()}>
            حاول مرة أخرى
          </Button>
        </div>
      </body>
    </html>
  );
}
