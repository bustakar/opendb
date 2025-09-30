-- Function to log skill changes
CREATE OR REPLACE FUNCTION public.log_skill_changes()
RETURNS TRIGGER AS $$
DECLARE
  changes_json JSONB;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    changes_json = to_jsonb(OLD);
    INSERT INTO public.audit_logs (entity_type, entity_id, action, user_id, changes)
    VALUES ('skill', OLD.id, 'delete', auth.uid(), changes_json);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    changes_json = jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    );
    INSERT INTO public.audit_logs (entity_type, entity_id, action, user_id, changes)
    VALUES ('skill', NEW.id, 'update', auth.uid(), changes_json);
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    changes_json = to_jsonb(NEW);
    INSERT INTO public.audit_logs (entity_type, entity_id, action, user_id, changes)
    VALUES ('skill', NEW.id, 'create', auth.uid(), changes_json);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log place changes
CREATE OR REPLACE FUNCTION public.log_place_changes()
RETURNS TRIGGER AS $$
DECLARE
  changes_json JSONB;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    changes_json = to_jsonb(OLD);
    INSERT INTO public.audit_logs (entity_type, entity_id, action, user_id, changes)
    VALUES ('place', OLD.id, 'delete', auth.uid(), changes_json);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    changes_json = jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    );
    INSERT INTO public.audit_logs (entity_type, entity_id, action, user_id, changes)
    VALUES ('place', NEW.id, 'update', auth.uid(), changes_json);
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    changes_json = to_jsonb(NEW);
    INSERT INTO public.audit_logs (entity_type, entity_id, action, user_id, changes)
    VALUES ('place', NEW.id, 'create', auth.uid(), changes_json);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for skills
CREATE TRIGGER audit_skill_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.skills
  FOR EACH ROW
  EXECUTE FUNCTION public.log_skill_changes();

-- Create triggers for places
CREATE TRIGGER audit_place_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.places
  FOR EACH ROW
  EXECUTE FUNCTION public.log_place_changes();
