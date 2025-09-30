'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AMENITIES, EQUIPMENT } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const placeFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().min(1, 'Address is required'),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  amenities: z.array(z.string()).min(1, 'Select at least one amenity'),
  equipment: z.array(z.string()).min(1, 'Select at least one equipment'),
  photos_urls: z.string().optional(),
});

type PlaceFormValues = z.infer<typeof placeFormSchema>;

type PlaceFormProps = {
  placeId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin?: boolean;
};

export function PlaceForm({
  placeId,
  open,
  onOpenChange,
  isAdmin = false,
}: PlaceFormProps) {
  const queryClient = useQueryClient();

  // Fetch existing place if editing
  const { data: existingPlace } = useQuery({
    queryKey: ['place', placeId],
    queryFn: async () => {
      if (!placeId) return null;
      const res = await fetch(`/api/places/${placeId}`);
      if (!res.ok) throw new Error('Failed to fetch place');
      return res.json();
    },
    enabled: !!placeId,
  });

  const form = useForm<PlaceFormValues>({
    resolver: zodResolver(placeFormSchema),
    defaultValues: {
      name: existingPlace?.name || '',
      description: existingPlace?.description || '',
      location: existingPlace?.location || '',
      address: existingPlace?.address || '',
      coordinates: existingPlace?.coordinates || { lat: 0, lng: 0 },
      amenities: existingPlace?.amenities || [],
      equipment: existingPlace?.equipment || [],
      photos_urls: existingPlace?.photos_urls?.join('\n') || '',
    },
  });

  // Reset form when existing place data loads
  if (existingPlace && !form.formState.isDirty) {
    form.reset({
      name: existingPlace.name,
      description: existingPlace.description,
      location: existingPlace.location,
      address: existingPlace.address,
      coordinates: existingPlace.coordinates,
      amenities: existingPlace.amenities,
      equipment: existingPlace.equipment,
      photos_urls: existingPlace.photos_urls?.join('\n') || '',
    });
  }

  const mutation = useMutation({
    mutationFn: async (values: PlaceFormValues) => {
      const payload = {
        ...values,
        photos_urls:
          values.photos_urls
            ?.split('\n')
            .map((url) => url.trim())
            .filter(Boolean) || [],
      };

      if (isAdmin && placeId) {
        // Admin direct edit
        const res = await fetch(`/api/places/${placeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update place');
        return res.json();
      } else {
        // User submission
        const res = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entity_type: 'place',
            action: placeId ? 'update' : 'create',
            data: payload,
            original_id: placeId || null,
          }),
        });
        if (!res.ok) throw new Error('Failed to create submission');
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      if (placeId) {
        queryClient.invalidateQueries({ queryKey: ['place', placeId] });
      }
      toast.success(
        isAdmin
          ? placeId
            ? 'Place updated'
            : 'Place created'
          : 'Submission created'
      );
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: PlaceFormValues) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isAdmin
              ? placeId
                ? 'Edit Place'
                : 'Create Place'
              : placeId
              ? 'Submit Edit for Place'
              : 'Submit New Place'}
          </DialogTitle>
          <DialogDescription>
            {isAdmin
              ? 'Changes will be applied immediately'
              : 'Your submission will be reviewed by an admin'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Central Park Workout Area" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the place..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (City/Region)</FormLabel>
                  <FormControl>
                    <Input placeholder="New York, NY" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123 Main St, New York, NY 10001"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="coordinates.lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="40.7831"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coordinates.lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="-73.9712"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amenities"
              render={() => (
                <FormItem>
                  <FormLabel>Amenities</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {AMENITIES.map((amenity) => (
                      <FormField
                        key={amenity}
                        control={form.control}
                        name="amenities"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(amenity)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, amenity])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== amenity
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {amenity.replace(/_/g, ' ')}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="equipment"
              render={() => (
                <FormItem>
                  <FormLabel>Equipment</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {EQUIPMENT.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="equipment"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {item.replace(/_/g, ' ')}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photos_urls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo URLs (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="https://example.com/photo.jpg"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>One URL per line</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending
                  ? 'Saving...'
                  : isAdmin
                  ? placeId
                    ? 'Update'
                    : 'Create'
                  : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
