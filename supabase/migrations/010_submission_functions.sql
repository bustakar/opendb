-- Function to handle submission approval
CREATE OR REPLACE FUNCTION public.approve_submission(
  submission_id UUID,
  reviewer_id UUID
)
RETURNS JSONB AS $$
DECLARE
  sub RECORD;
  new_entity_id UUID;
  skill_data JSONB;
  place_data JSONB;
BEGIN
  -- Get submission
  SELECT * INTO sub
  FROM public.submissions
  WHERE id = submission_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Submission not found or already processed');
  END IF;

  -- Check if reviewer is admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = reviewer_id AND role = 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Process based on entity type and action
  IF sub.entity_type = 'skill' THEN
    IF sub.action = 'create' THEN
      -- Insert new skill
      INSERT INTO public.skills (
        title, description, level, difficulty, muscle_groups, equipment, video_urls, created_by
      )
      SELECT
        (sub.data->>'title')::TEXT,
        (sub.data->>'description')::TEXT,
        (sub.data->>'level')::TEXT,
        (sub.data->>'difficulty')::INTEGER,
        ARRAY(SELECT jsonb_array_elements_text(sub.data->'muscle_groups')),
        ARRAY(SELECT jsonb_array_elements_text(sub.data->'equipment')),
        COALESCE(ARRAY(SELECT jsonb_array_elements_text(sub.data->'video_urls')), ARRAY[]::TEXT[]),
        sub.submitted_by
      RETURNING id INTO new_entity_id;

      -- Handle variants if present
      IF sub.data ? 'variants' THEN
        INSERT INTO public.skill_variants (skill_id, variant_skill_id)
        SELECT new_entity_id, (jsonb_array_elements_text(sub.data->'variants'))::UUID;
      END IF;

      -- Handle prerequisites if present
      IF sub.data ? 'prerequisites' THEN
        INSERT INTO public.skill_prerequisites (skill_id, prerequisite_skill_id)
        SELECT new_entity_id, (jsonb_array_elements_text(sub.data->'prerequisites'))::UUID;
      END IF;

    ELSIF sub.action = 'update' THEN
      -- Update existing skill
      UPDATE public.skills SET
        title = (sub.data->>'title')::TEXT,
        description = (sub.data->>'description')::TEXT,
        level = (sub.data->>'level')::TEXT,
        difficulty = (sub.data->>'difficulty')::INTEGER,
        muscle_groups = ARRAY(SELECT jsonb_array_elements_text(sub.data->'muscle_groups')),
        equipment = ARRAY(SELECT jsonb_array_elements_text(sub.data->'equipment')),
        video_urls = COALESCE(ARRAY(SELECT jsonb_array_elements_text(sub.data->'video_urls')), ARRAY[]::TEXT[]),
        updated_at = NOW()
      WHERE id = sub.original_id;

      new_entity_id = sub.original_id;

      -- Update variants
      IF sub.data ? 'variants' THEN
        DELETE FROM public.skill_variants WHERE skill_id = sub.original_id;
        INSERT INTO public.skill_variants (skill_id, variant_skill_id)
        SELECT sub.original_id, (jsonb_array_elements_text(sub.data->'variants'))::UUID;
      END IF;

      -- Update prerequisites
      IF sub.data ? 'prerequisites' THEN
        DELETE FROM public.skill_prerequisites WHERE skill_id = sub.original_id;
        INSERT INTO public.skill_prerequisites (skill_id, prerequisite_skill_id)
        SELECT sub.original_id, (jsonb_array_elements_text(sub.data->'prerequisites'))::UUID;
      END IF;

    ELSIF sub.action = 'delete' THEN
      DELETE FROM public.skills WHERE id = sub.original_id;
      new_entity_id = sub.original_id;
    END IF;

  ELSIF sub.entity_type = 'place' THEN
    IF sub.action = 'create' THEN
      -- Insert new place
      INSERT INTO public.places (
        name, description, location, address, coordinates, amenities, equipment, photos_urls, created_by
      )
      SELECT
        (sub.data->>'name')::TEXT,
        (sub.data->>'description')::TEXT,
        (sub.data->>'location')::TEXT,
        (sub.data->>'address')::TEXT,
        sub.data->'coordinates',
        ARRAY(SELECT jsonb_array_elements_text(sub.data->'amenities')),
        ARRAY(SELECT jsonb_array_elements_text(sub.data->'equipment')),
        COALESCE(ARRAY(SELECT jsonb_array_elements_text(sub.data->'photos_urls')), ARRAY[]::TEXT[]),
        sub.submitted_by
      RETURNING id INTO new_entity_id;

    ELSIF sub.action = 'update' THEN
      -- Update existing place
      UPDATE public.places SET
        name = (sub.data->>'name')::TEXT,
        description = (sub.data->>'description')::TEXT,
        location = (sub.data->>'location')::TEXT,
        address = (sub.data->>'address')::TEXT,
        coordinates = sub.data->'coordinates',
        amenities = ARRAY(SELECT jsonb_array_elements_text(sub.data->'amenities')),
        equipment = ARRAY(SELECT jsonb_array_elements_text(sub.data->'equipment')),
        photos_urls = COALESCE(ARRAY(SELECT jsonb_array_elements_text(sub.data->'photos_urls')), ARRAY[]::TEXT[]),
        updated_at = NOW()
      WHERE id = sub.original_id;

      new_entity_id = sub.original_id;

    ELSIF sub.action = 'delete' THEN
      DELETE FROM public.places WHERE id = sub.original_id;
      new_entity_id = sub.original_id;
    END IF;
  END IF;

  -- Update submission status
  UPDATE public.submissions
  SET
    status = 'approved',
    reviewed_by = reviewer_id,
    reviewed_at = NOW()
  WHERE id = submission_id;

  RETURN jsonb_build_object(
    'success', true,
    'entity_id', new_entity_id,
    'entity_type', sub.entity_type,
    'action', sub.action
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle submission rejection
CREATE OR REPLACE FUNCTION public.reject_submission(
  submission_id UUID,
  reviewer_id UUID
)
RETURNS JSONB AS $$
DECLARE
  sub RECORD;
BEGIN
  -- Get submission
  SELECT * INTO sub
  FROM public.submissions
  WHERE id = submission_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Submission not found or already processed');
  END IF;

  -- Check if reviewer is admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = reviewer_id AND role = 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Update submission status
  UPDATE public.submissions
  SET
    status = 'rejected',
    reviewed_by = reviewer_id,
    reviewed_at = NOW()
  WHERE id = submission_id;

  RETURN jsonb_build_object(
    'success', true,
    'submission_id', submission_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
