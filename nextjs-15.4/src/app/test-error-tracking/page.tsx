import { DashboardLayout } from '@/components/dashboard/layout';
import { TestErrorTrackingClient } from './test-error-tracking-client';

export default function TestErrorTrackingPage() {
  return (
    <DashboardLayout>
      <TestErrorTrackingClient />
    </DashboardLayout>
  );
}