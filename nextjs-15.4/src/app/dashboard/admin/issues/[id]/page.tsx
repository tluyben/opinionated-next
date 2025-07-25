import { requireAuth } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { getIssueByIdAction } from '@/lib/actions/issues';
import { IssueDetails } from '@/components/admin/issue-details';

interface IssueDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function IssueDetailPage({ params }: IssueDetailPageProps) {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  const { id } = await params;
  const issue = await getIssueByIdAction(id);
  
  if (!issue) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <IssueDetails issue={issue} />
      </div>
    </DashboardLayout>
  );
}