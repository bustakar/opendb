-- Create places table
CREATE TABLE IF NOT EXISTS public.places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  equipment TEXT[] NOT NULL DEFAULT '{}',
  photos_urls TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Add trigger for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.places
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX idx_places_location ON public.places(location);
CREATE INDEX idx_places_created_by ON public.places(created_by);
CREATE INDEX idx_places_amenities ON public.places USING GIN(amenities);
CREATE INDEX idx_places_equipment ON public.places USING GIN(equipment);
CREATE INDEX idx_places_coordinates ON public.places USING GIN(coordinates);
