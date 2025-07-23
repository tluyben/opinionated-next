import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/session';
import { listTablesAction } from '@/lib/actions/database';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, Table as TableIcon } from 'lucide-react';
import Link from 'next/link';

export default async function DatabasePage() {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  const result = await listTablesAction();

  if (!result.success) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-2 mb-6">
            <Database className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Database Admin</h1>
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

  const tables = result.tables || [];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Database className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Database Admin</h1>
        <Badge variant="secondary">{tables.length} tables</Badge>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
            <CardDescription>
              Click on any table to view and manage its data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tables.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No tables found in the database
              </p>
            ) : (
              <div className="space-y-4">
                {/* Mobile view - Cards */}
                <div className="block md:hidden space-y-3">
                  {tables.map((table) => (
                    <Link key={table.name} href={`/database/${table.name}`}>
                      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <TableIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{table.name}</h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {table.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {table.recordCount} record{table.recordCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Desktop view - Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Table Name</TableHead>
                        <TableHead className="hidden md:table-cell">Description</TableHead>
                        <TableHead className="hidden lg:table-cell">Records</TableHead>
                        <TableHead className="w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tables.map((table) => (
                        <TableRow key={table.name} className="hover:bg-accent/50">
                          <TableCell>
                            <TableIcon className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                          <TableCell className="font-medium">{table.name}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {table.description}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant="secondary" className="text-xs">
                              {table.recordCount.toLocaleString()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/database/${table.name}`}
                              className="text-sm text-primary hover:underline"
                            >
                              Manage Data
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Database Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Database Type:</span>
              <span>SQLite</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Tables:</span>
              <span>{tables.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Access Level:</span>
              <Badge variant="outline" className="text-xs">Admin Only</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  );
}