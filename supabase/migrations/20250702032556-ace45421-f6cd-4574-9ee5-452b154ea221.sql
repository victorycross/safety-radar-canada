
-- Phase 1: Database Schema Updates

-- Extend the app_role enum to include 'auditor' role
ALTER TYPE public.app_role ADD VALUE 'auditor';

-- Create enhanced user management audit table
CREATE TABLE public.user_management_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  target_user_email TEXT,
  performed_by UUID REFERENCES auth.users(id),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user management audit table
ALTER TABLE public.user_management_audit ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user management audit
CREATE POLICY "Admins can view all user audit logs"
  ON public.user_management_audit
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "System can insert user audit logs"
  ON public.user_management_audit
  FOR INSERT
  WITH CHECK (true);

-- Create function to log user management actions
CREATE OR REPLACE FUNCTION public.log_user_management_action(
  action_type TEXT,
  target_user_id UUID DEFAULT NULL,
  target_user_email TEXT DEFAULT NULL,
  old_values JSONB DEFAULT NULL,
  new_values JSONB DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_management_audit (
    action,
    target_user_id,
    target_user_email,
    performed_by,
    old_values,
    new_values,
    created_at
  ) VALUES (
    action_type,
    target_user_id,
    target_user_email,
    auth.uid(),
    old_values,
    new_values,
    now()
  );
END;
$$;

-- Create function for admin to create users
CREATE OR REPLACE FUNCTION public.admin_create_user(
  user_email TEXT,
  user_password TEXT,
  user_full_name TEXT DEFAULT NULL,
  user_role app_role DEFAULT 'regular_user'
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Check if caller is admin
  IF NOT public.is_admin() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient permissions'
    );
  END IF;

  -- This function would need to be implemented with proper user creation logic
  -- For now, return a placeholder response
  RETURN json_build_object(
    'success', false,
    'error', 'Admin user creation requires additional Supabase configuration'
  );
END;
$$;

-- Add trigger to log role changes
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_user_management_action(
      'role_assigned',
      NEW.user_id,
      (SELECT email FROM auth.users WHERE id = NEW.user_id),
      NULL,
      json_build_object('role', NEW.role)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_user_management_action(
      'role_changed',
      NEW.user_id,
      (SELECT email FROM auth.users WHERE id = NEW.user_id),
      json_build_object('role', OLD.role),
      json_build_object('role', NEW.role)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_user_management_action(
      'role_removed',
      OLD.user_id,
      (SELECT email FROM auth.users WHERE id = OLD.user_id),
      json_build_object('role', OLD.role),
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger on user_roles table
DROP TRIGGER IF EXISTS trigger_log_role_changes ON public.user_roles;
CREATE TRIGGER trigger_log_role_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_role_changes();

-- Create helper function to check if user has auditor role
CREATE OR REPLACE FUNCTION public.is_auditor(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.has_role(_user_id, 'auditor')
$$;

-- Create helper function to check if user is auditor or admin
CREATE OR REPLACE FUNCTION public.is_auditor_or_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'auditor')
$$;
