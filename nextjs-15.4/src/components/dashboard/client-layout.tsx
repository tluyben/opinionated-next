'use client';

import { Sidebar } from './sidebar';
import { SessionUser } from '@/lib/auth/session';

interface ClientDashboardLayoutProps {
  children: React.ReactNode;
  user: SessionUser;
}

export function ClientDashboardLayout({ children, user }: ClientDashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar user={user} />
      <div className="lg:pl-64">
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="pt-12 lg:pt-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}