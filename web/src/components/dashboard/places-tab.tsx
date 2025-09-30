'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { ChevronLeft, ChevronRight, MapPin, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { PlaceDialog } from './place-dialog';

type Place = {
  id: string;
  name: string;
  location: string;
  amenities: string[];
  equipment: string[];
  upvote_count: { upvote_count: number }[];
};

export function PlacesTab() {
  const { isAdmin } = useAuth();
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>(
    'view'
  );

  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['places', searchTerm, locationFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
      });
      if (searchTerm) params.append('search', searchTerm);
      if (locationFilter) params.append('location', locationFilter);

      const res = await fetch(`/api/places?${params}`);
      if (!res.ok) throw new Error('Failed to fetch places');
      return res.json();
    },
  });

  const places: Place[] = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Places</h2>
          <p className="text-sm text-muted-foreground">
            {total} place{total !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setSelectedPlace(null);
              setDialogMode('create');
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isAdmin ? 'Add Place' : 'Submit Place'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search places..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : places.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No places found
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Amenities</TableHead>
                <TableHead>Upvotes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {places.map((place) => (
                <TableRow key={place.id}>
                  <TableCell className="font-medium">{place.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="text-sm">{place.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {place.amenities.slice(0, 2).map((amenity) => (
                        <Badge
                          key={amenity}
                          variant="secondary"
                          className="text-xs"
                        >
                          {amenity}
                        </Badge>
                      ))}
                      {place.amenities.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{place.amenities.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {place.upvote_count?.[0]?.upvote_count || 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPlace(place.id);
                          setDialogMode('view');
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPlace(place.id);
                          setDialogMode('edit');
                        }}
                      >
                        {isAdmin ? 'Edit' : 'Submit Edit'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <PlaceDialog
        placeId={selectedPlace || undefined}
        open={!!selectedPlace || dialogMode === 'create'}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPlace(null);
            setDialogMode('view');
          }
        }}
        mode={dialogMode}
      />
    </div>
  );
}
