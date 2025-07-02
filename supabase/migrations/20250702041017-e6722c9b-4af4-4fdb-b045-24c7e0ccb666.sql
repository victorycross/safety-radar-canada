
-- Create the user_management_audit table that's referenced in the code but doesn't exist
CREATE TABLE IF NOT EXISTS public.user_management_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  target_user_id UUID,
  target_user_email TEXT,
  performed_by UUID REFERENCES auth.users(id),
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on the audit table
ALTER TABLE public.user_management_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view user management audit logs" ON public.user_management_audit
  FOR SELECT TO authenticated USING (public.is_admin());

-- System can insert audit logs
CREATE POLICY "System can insert user management audit logs" ON public.user_management_audit
  FOR INSERT WITH CHECK (true);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_management_audit_target_user ON public.user_management_audit(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_management_audit_created_at ON public.user_management_audit(created_at);
