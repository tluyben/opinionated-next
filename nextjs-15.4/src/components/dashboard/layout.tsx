import { getSession, requireVerifiedAuth } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Sidebar } from './sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  try {
    const user = await requireVerifiedAuth();
    
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    if (message === 'Authentication required') {
      redirect('/login');
    } else if (message === 'Email verification required') {
      redirect('/verify-email-required');
    }
    
    // Fallback redirect
    redirect('/login');
  }
}