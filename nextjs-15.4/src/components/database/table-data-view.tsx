'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Key, ChevronLeft, ChevronRight } from 'lucide-react';
import { TableData, ColumnInfo, insertRecordAction, updateRecordAction, deleteRecordAction } from '@/lib/actions/database';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface TableDataViewProps {
  tableName: string;
  data: TableData;
  currentPage: number;
}

export function TableDataView({ tableName, data, currentPage }: TableDataViewProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, any> | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { columns, rows, totalCount } = data;
  const primaryKeyColumn = columns.find(col => col.pk === 1);
  const itemsPerPage = 50;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const formatValue = (value: any, column: ColumnInfo) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">null</span>;
    }
    
    if (typeof value === 'boolean') {
      return <Badge variant={value ? 'default' : 'secondary'}>{value.toString()}</Badge>;
    }

    // Handle timestamp columns
    if (column.type.includes('timestamp') || column.name.includes('_at')) {
      try {
        const date = new Date(typeof value === 'number' ? value * 1000 : value);
        if (!isNaN(date.getTime())) {
          return (
            <span className="text-sm">
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </span>
          );
        }
      } catch (e) {
        // Fall through to default handling
      }
    }

    const stringValue = String(value);
    if (stringValue.length > 50) {
      return (
        <span className="truncate block max-w-xs" title={stringValue}>
          {stringValue.substring(0, 50)}...
        </span>
      );
    }

    return stringValue;
  };

  const handleInputChange = (columnName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [columnName]: value
    }));
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const result = await insertRecordAction(tableName, formData);
      if (result.success) {
        toast.success('Record created successfully');
        setIsCreateOpen(false);
        setFormData({});
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to create record');
      }
    } catch (error) {
      toast.error('An error occurred while creating the record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingRecord || !primaryKeyColumn) return;
    
    setIsSubmitting(true);
    try {
      const primaryKeyValue = editingRecord[primaryKeyColumn.name];
      const result = await updateRecordAction(tableName, primaryKeyColumn.name, primaryKeyValue, formData);
      if (result.success) {
        toast.success('Record updated successfully');
        setEditingRecord(null);
        setFormData({});
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update record');
      }
    } catch (error) {
      toast.error('An error occurred while updating the record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (record: Record<string, any>) => {
    if (!primaryKeyColumn) return;
    
    try {
      const primaryKeyValue = record[primaryKeyColumn.name];
      const result = await deleteRecordAction(tableName, primaryKeyColumn.name, primaryKeyValue);
      if (result.success) {
        toast.success('Record deleted successfully');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to delete record');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the record');
    }
  };

  const openEditDialog = (record: Record<string, any>) => {
    setEditingRecord(record);
    setFormData({ ...record });
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      router.push(`/database/${tableName}?page=${page}`);
    }
  };

  const renderFormField = (column: ColumnInfo, value: any = '') => {
    const isPrimaryKey = column.pk === 1;
    const isEditing = editingRecord !== null;
    const shouldDisable = isPrimaryKey && isEditing;

    if (column.type.toLowerCase().includes('text') && !column.type.includes('(')) {
      return (
        <Textarea
          value={value || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleInputChange(column.name, e.target.value)}
          disabled={shouldDisable}
          placeholder={column.dflt_value || ''}
          rows={3}
        />
      );
    }

    return (
      <Input
        type={column.type.toLowerCase().includes('int') ? 'number' : 'text'}
        value={value || ''}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleInputChange(column.name, e.target.value)}
        disabled={shouldDisable}
        placeholder={column.dflt_value || ''}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Table Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>{tableName}</span>
                <Badge variant="outline">{totalCount} records</Badge>
              </CardTitle>
              <CardDescription>
                {columns.length} columns • Page {currentPage} of {totalPages}
              </CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Record</DialogTitle>
                  <DialogDescription>
                    Add a new record to the {tableName} table
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {columns.map((column) => (
                    <div key={column.name} className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor={column.name} className="text-right mt-2">
                        <span className="font-medium">{column.name}</span>
                        {column.pk === 1 && <Key className="h-3 w-3 inline ml-1" />}
                        {column.notnull === 1 && <span className="text-destructive">*</span>}
                        <div className="text-xs font-normal text-muted-foreground mt-1">
                          {column.userFriendlyType}
                        </div>
                      </Label>
                      <div className="col-span-3">
                        {renderFormField(column, formData[column.name])}
                        <p className="text-xs text-muted-foreground mt-1">
                          {column.description} {column.notnull === 1 && '(required)'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Record'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No records found</p>
            </div>
          ) : (
            <>
              {/* Mobile view - Cards */}
              <div className="block lg:hidden p-4 space-y-4">
                {rows.map((row, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2">
                      {columns.slice(0, 3).map((column) => (
                        <div key={column.name} className="flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            {column.name}:
                          </span>
                          <span className="text-sm">{formatValue(row[column.name], column)}</span>
                        </div>
                      ))}
                      {columns.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{columns.length - 3} more fields
                        </p>
                      )}
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(row)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        {primaryKeyColumn && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Record</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this record? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(row)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop view - Table */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column) => (
                        <TableHead key={column.name} className="min-w-32">
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">{column.name}</span>
                            {column.pk === 1 && <Key className="h-3 w-3" />}
                          </div>
                          <div className="text-xs text-muted-foreground font-normal">
                            {column.userFriendlyType}
                          </div>
                          <div className="text-xs text-muted-foreground font-normal italic">
                            {column.description}
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, index) => (
                      <TableRow key={index}>
                        {columns.map((column) => (
                          <TableCell key={column.name} className="max-w-xs">
                            {formatValue(row[column.name], column)}
                          </TableCell>
                        ))}
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost" onClick={() => openEditDialog(row)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            {primaryKeyColumn && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Record</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this record? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(row)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} records
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editingRecord !== null} onOpenChange={(open: boolean) => {
        if (!open) {
          setEditingRecord(null);
          setFormData({});
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
            <DialogDescription>
              Modify the selected record in the {tableName} table
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {columns.map((column) => (
              <div key={column.name} className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor={column.name} className="text-right mt-2">
                  <span className="font-medium">{column.name}</span>
                  {column.pk === 1 && <Key className="h-3 w-3 inline ml-1" />}
                  {column.notnull === 1 && <span className="text-destructive">*</span>}
                  <div className="text-xs font-normal text-muted-foreground mt-1">
                    {column.userFriendlyType}
                  </div>
                </Label>
                <div className="col-span-3">
                  {renderFormField(column, formData[column.name])}
                  <p className="text-xs text-muted-foreground mt-1">
                    {column.description} {column.pk === 1 && '(read-only)'} {column.notnull === 1 && '(required)'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {
              setEditingRecord(null);
              setFormData({});
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Record'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}