'use client';

import { useEffect } from 'react';
import { initializeGlobalErrorHandling } from '@/lib/error-tracking/global-handler';

export function ErrorTrackingInitializer() {
  useEffect(() => {
    initializeGlobalErrorHandling();
  }, []);

  return null;
}