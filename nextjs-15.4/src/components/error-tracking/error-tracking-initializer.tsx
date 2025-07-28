'use client';

import { useEffect } from 'react';
import { initializeEnhancedErrorTracking } from '@/lib/error-tracking/enhanced-client-handler';

export function ErrorTrackingInitializer() {
  useEffect(() => {
    initializeEnhancedErrorTracking();
  }, []);

  return null;
}