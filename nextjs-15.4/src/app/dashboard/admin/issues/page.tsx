import { requireAuth } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { IssuesList } from '@/components/admin/issues-list';
import { IssueStats } from '@/components/admin/issue-stats';
import { getIssuesAction, getIssueStatsAction } from '@/lib/actions/issues';

interface IssuesPageProps {
  searchParams: {
    status?: string;
    level?: string;
    search?: string;
    page?: string;
  };
}

export default async function IssuesPage({ searchParams }: IssuesPageProps) {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  const { status, level, search, page = '1' } = searchParams;
  const currentPage = parseInt(page, 10);
  const limit = 20;
  const offset = (currentPage - 1) * limit;

  const [issues, stats] = await Promise.all([
    getIssuesAction({
      status: status as any,
      level: level as any,
      search,
      limit,
      offset
    }),
    getIssueStatsAction()
  ]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Issues</h1>
          <p className="text-muted-foreground">
            Monitor and manage application errors and issues
          </p>
        </div>
      </div>

      <IssueStats stats={stats} />
      
      <IssuesList 
        issues={issues}
        currentPage={currentPage}
        filters={{
          status,
          level,
          search
        }}
      />
    </div>
  );
}