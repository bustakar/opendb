'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/lib/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { SubmissionDialog } from './submission-dialog';

type Submission = {
  id: string;
  entity_type: string;
  action: string;
  status: string;
  data: {
    title?: string;
    name?: string;
    [key: string]: unknown;
  };
  created_at: string;
  submitter: { email: string };
};

export function SubmissionsTab() {
  const { isAdmin } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(
    null
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const res = await fetch('/api/submissions');
      if (!res.ok) throw new Error('Failed to fetch submissions');
      return res.json();
    },
  });

  const submissions: Submission[] = data?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'approved':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Submissions</h2>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? 'Review and manage all submissions'
              : 'Track your submitted changes'}
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Submission
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No submissions found
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Title/Name</TableHead>
                {isAdmin && <TableHead>Submitter</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <Badge variant="outline">{submission.entity_type}</Badge>
                  </TableCell>
                  <TableCell className="capitalize">
                    {submission.action}
                  </TableCell>
                  <TableCell className="font-medium">
                    {submission.data.title || submission.data.name || 'N/A'}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-sm text-muted-foreground">
                      {submission.submitter?.email}
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge
                      variant={
                        getStatusColor(submission.status) as
                          | 'default'
                          | 'secondary'
                          | 'destructive'
                          | 'outline'
                      }
                    >
                      {submission.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(submission.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSubmission(submission.id)}
                    >
                      {submission.status === 'pending' && isAdmin
                        ? 'Review'
                        : 'View'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedSubmission && (
        <SubmissionDialog
          submissionId={selectedSubmission}
          open={!!selectedSubmission}
          onOpenChange={(open) => !open && setSelectedSubmission(null)}
        />
      )}

      {isCreateOpen && (
        <SubmissionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      )}
    </div>
  );
}
