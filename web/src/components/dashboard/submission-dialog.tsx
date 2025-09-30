'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/hooks/use-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

type SubmissionDialogProps = {
  submissionId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SubmissionDialog({
  submissionId,
  open,
  onOpenChange,
}: SubmissionDialogProps) {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['submission', submissionId],
    queryFn: async () => {
      if (!submissionId) return null;
      const res = await fetch('/api/submissions');
      if (!res.ok) throw new Error('Failed to fetch submission');
      const result = await res.json();
      return result.data.find((s: { id: string }) => s.id === submissionId);
    },
    enabled: !!submissionId,
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/admin/submissions/${submissionId}/approve`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error('Failed to approve');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast.success('Submission approved');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to approve submission');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/submissions/${submissionId}/reject`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to reject');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast.success('Submission rejected');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to reject submission');
    },
  });

  if (!submissionId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Submission</DialogTitle>
            <DialogDescription>
              Choose what you want to submit: a new skill, place, or an edit to
              existing data
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground py-4">
            Form for creating submissions will be implemented here
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : data ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {data.entity_type === 'skill' ? 'Skill' : 'Place'} Submission
              </DialogTitle>
              <DialogDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{data.action}</Badge>
                  <Badge
                    variant={
                      data.status === 'pending'
                        ? 'default'
                        : data.status === 'approved'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {data.status}
                  </Badge>
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Submitted Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    {Object.entries(data.data).map(([key, value]) => {
                      if (Array.isArray(value)) {
                        return (
                          <div key={key}>
                            <dt className="font-semibold capitalize">
                              {key.replace(/_/g, ' ')}:
                            </dt>
                            <dd className="text-muted-foreground ml-2">
                              {value.join(', ') || 'None'}
                            </dd>
                          </div>
                        );
                      }
                      if (typeof value === 'object' && value !== null) {
                        return (
                          <div key={key}>
                            <dt className="font-semibold capitalize">
                              {key.replace(/_/g, ' ')}:
                            </dt>
                            <dd className="text-muted-foreground ml-2">
                              {JSON.stringify(value)}
                            </dd>
                          </div>
                        );
                      }
                      return (
                        <div key={key}>
                          <dt className="font-semibold capitalize">
                            {key.replace(/_/g, ' ')}:
                          </dt>
                          <dd className="text-muted-foreground ml-2">
                            {String(value)}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </CardContent>
              </Card>

              <div className="text-xs text-muted-foreground">
                <p>Submitted by: {data.submitter?.email}</p>
                <p>Date: {new Date(data.created_at).toLocaleString()}</p>
                {data.reviewed_at && (
                  <p>Reviewed: {new Date(data.reviewed_at).toLocaleString()}</p>
                )}
              </div>
            </div>

            {isAdmin && data.status === 'pending' && (
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => rejectMutation.mutate()}
                  disabled={rejectMutation.isPending}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </DialogFooter>
            )}
          </>
        ) : (
          <div className="text-center py-8">Submission not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
