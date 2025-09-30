'use client';

import { PlaceForm } from '@/components/forms/place-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/hooks/use-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, MapPin, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

type PlaceDialogProps = {
  placeId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'view' | 'edit' | 'create';
};

export function PlaceDialog({
  placeId,
  open,
  onOpenChange,
  mode = 'view',
}: PlaceDialogProps) {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['place', placeId],
    queryFn: async () => {
      if (!placeId) return null;
      const res = await fetch(`/api/places/${placeId}`);
      if (!res.ok) throw new Error('Failed to fetch place');
      return res.json();
    },
    enabled: !!placeId,
  });

  const upvoteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/places/${placeId}/upvote`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to toggle upvote');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['place', placeId] });
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast.success('Upvote toggled');
    },
    onError: () => {
      toast.error('Failed to toggle upvote');
    },
  });

  // Use form for create/edit mode
  if (mode === 'create' || mode === 'edit') {
    return (
      <PlaceForm
        placeId={placeId}
        open={open}
        onOpenChange={onOpenChange}
        isAdmin={isAdmin}
      />
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
              <DialogTitle>{data.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {data.location}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <Button
                  variant={data.user_has_upvoted ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => upvoteMutation.mutate()}
                  disabled={upvoteMutation.isPending}
                >
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  {data.upvote_count?.[0]?.upvote_count || 0} Upvotes
                </Button>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {data.description}
                </p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Address:</span>
                      <p className="text-muted-foreground">{data.address}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Coordinates:</span>
                      <p className="text-muted-foreground">
                        {data.coordinates.lat.toFixed(6)},{' '}
                        {data.coordinates.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="font-semibold mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {data.amenities.map((amenity: string) => (
                    <Badge key={amenity} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Equipment</h3>
                <div className="flex flex-wrap gap-2">
                  {data.equipment.map((item: string) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              {data.photos_urls && data.photos_urls.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Photos</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {data.photos_urls.map((url: string, idx: number) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Photo {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8">Place not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
