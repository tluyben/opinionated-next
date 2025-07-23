import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/session';
import { getTableDataAction } from '@/lib/actions/database';
import { DashboardLayout } from '@/components/dashboard/layout';
import { TableDataView } from '@/components/database/table-data-view';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Database, Table as TableIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface TablePageProps {
  params: Promise<{
    table: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function TablePage({ params, searchParams }: TablePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  const tableName = decodeURIComponent(resolvedParams.table);
  const page = parseInt(resolvedSearchParams.page || '1');
  const result = await getTableDataAction(tableName, page, 50);

  if (!result.success) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link href="/database">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Database
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">Error: {result.error}</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/database">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <TableIcon className="h-6 w-6" />
            <h1 className="text-2xl font-bold">{tableName}</h1>
          </div>
        </div>
      </div>

      <TableDataView 
        tableName={tableName}
        data={result.data!}
        currentPage={page}
      />
      </div>
    </DashboardLayout>
  );
}