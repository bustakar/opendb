-- Create skill_variants junction table
CREATE TABLE IF NOT EXISTS public.skill_variants (
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  variant_skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (skill_id, variant_skill_id),
  CHECK (skill_id != variant_skill_id)
);

-- Create skill_prerequisites junction table
CREATE TABLE IF NOT EXISTS public.skill_prerequisites (
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  prerequisite_skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (skill_id, prerequisite_skill_id),
  CHECK (skill_id != prerequisite_skill_id)
);

-- Create indexes
CREATE INDEX idx_skill_variants_skill_id ON public.skill_variants(skill_id);
CREATE INDEX idx_skill_variants_variant_skill_id ON public.skill_variants(variant_skill_id);
CREATE INDEX idx_skill_prerequisites_skill_id ON public.skill_prerequisites(skill_id);
CREATE INDEX idx_skill_prerequisites_prerequisite_skill_id ON public.skill_prerequisites(prerequisite_skill_id);
