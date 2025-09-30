-- Create submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('skill', 'place')),
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  original_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ NULL
);

-- Add trigger for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX idx_submissions_entity_type ON public.submissions(entity_type);
CREATE INDEX idx_submissions_action ON public.submissions(action);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_submitted_by ON public.submissions(submitted_by);
CREATE INDEX idx_submissions_original_id ON public.submissions(original_id);
CREATE INDEX idx_submissions_reviewed_by ON public.submissions(reviewed_by);
