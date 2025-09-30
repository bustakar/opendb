-- Create place_upvotes table
CREATE TABLE IF NOT EXISTS public.place_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(place_id, user_id)
);

-- Create indexes
CREATE INDEX idx_place_upvotes_place_id ON public.place_upvotes(place_id);
CREATE INDEX idx_place_upvotes_user_id ON public.place_upvotes(user_id);

-- Create view to count upvotes per place
CREATE OR REPLACE VIEW public.place_upvote_counts AS
SELECT 
  place_id,
  COUNT(*) as upvote_count
FROM public.place_upvotes
GROUP BY place_id;
