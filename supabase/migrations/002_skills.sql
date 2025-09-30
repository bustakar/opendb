-- Create skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'elite')),
  difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 10),
  muscle_groups TEXT[] NOT NULL DEFAULT '{}',
  equipment TEXT[] NOT NULL DEFAULT '{}',
  video_urls TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Add trigger for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.skills
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX idx_skills_level ON public.skills(level);
CREATE INDEX idx_skills_difficulty ON public.skills(difficulty);
CREATE INDEX idx_skills_created_by ON public.skills(created_by);
CREATE INDEX idx_skills_muscle_groups ON public.skills USING GIN(muscle_groups);
CREATE INDEX idx_skills_equipment ON public.skills USING GIN(equipment);
