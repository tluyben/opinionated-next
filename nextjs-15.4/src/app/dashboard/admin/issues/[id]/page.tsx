import { requireAuth } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { getIssueByIdAction } from '@/lib/actions/issues';
import { IssueDetails } from '@/components/admin/issue-details';

interface IssueDetailPageProps {
  params: { id: string };
}

export default async function IssueDetailPage({ params }: IssueDetailPageProps) {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  const issue = await getIssueByIdAction(params.id);
  
  if (!issue) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <IssueDetails issue={issue} />
    </div>
  );
}