-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Skills policies
CREATE POLICY "Skills are viewable by authenticated users"
  ON public.skills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert skills"
  ON public.skills FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update skills"
  ON public.skills FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Only admins can delete skills"
  ON public.skills FOR DELETE
  TO authenticated
  USING (is_admin());

-- Skill variants policies
CREATE POLICY "Skill variants are viewable by authenticated users"
  ON public.skill_variants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage skill variants"
  ON public.skill_variants FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Skill prerequisites policies
CREATE POLICY "Skill prerequisites are viewable by authenticated users"
  ON public.skill_prerequisites FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage skill prerequisites"
  ON public.skill_prerequisites FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Places policies
CREATE POLICY "Places are viewable by authenticated users"
  ON public.places FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert places"
  ON public.places FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update places"
  ON public.places FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Only admins can delete places"
  ON public.places FOR DELETE
  TO authenticated
  USING (is_admin());

-- Place upvotes policies
CREATE POLICY "Place upvotes are viewable by authenticated users"
  ON public.place_upvotes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own upvotes"
  ON public.place_upvotes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upvotes"
  ON public.place_upvotes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Submissions policies
CREATE POLICY "Users can view their own submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = submitted_by OR is_admin());

CREATE POLICY "Users can create submissions"
  ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can update their own pending submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = submitted_by AND status = 'pending');

CREATE POLICY "Admins can update all submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Audit logs policies
CREATE POLICY "All authenticated users can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());
