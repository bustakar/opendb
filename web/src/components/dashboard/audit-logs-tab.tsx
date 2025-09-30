'use client';

import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export function AuditLogsTab() {
  const [entityType, setEntityType] = useState<string>('all');
  const [action, setAction] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', entityType, action],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (entityType !== 'all') params.append('entityType', entityType);
      if (action !== 'all') params.append('action', action);

      const res = await fetch(`/api/admin/audit-logs?${params}`);
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      return res.json();
    },
  });

  const logs = data?.data || [];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audit Logs</h2>
          <p className="text-sm text-muted-foreground">
            Complete history of all database changes
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Select value={entityType} onValueChange={setEntityType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Entity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="skill">Skills</SelectItem>
            <SelectItem value="place">Places</SelectItem>
          </SelectContent>
        </Select>

        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No audit logs found
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map(
                (log: {
                  id: string;
                  entity_type: string;
                  entity_id: string;
                  action: string;
                  user: { email: string } | null;
                  created_at: string;
                }) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant="outline">{log.entity_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          getActionColor(log.action) as
                            | 'default'
                            | 'secondary'
                            | 'destructive'
                            | 'outline'
                        }
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.entity_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.user?.email || 'System'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
