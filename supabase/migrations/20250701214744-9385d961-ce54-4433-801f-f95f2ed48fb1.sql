
-- Update RLS policies for alert_sources table to allow power users to manage feeds

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can manage alert sources" ON public.alert_sources;
DROP POLICY IF EXISTS "Admins can view alert sources" ON public.alert_sources;

-- Create new policies that allow both admins and power users
CREATE POLICY "Admin and power users can manage alert sources"
  ON public.alert_sources
  FOR ALL
  TO authenticated
  USING (public.is_power_user_or_admin(auth.uid()))
  WITH CHECK (public.is_power_user_or_admin(auth.uid()));

CREATE POLICY "Admin and power users can view alert sources"
  ON public.alert_sources
  FOR SELECT
  TO authenticated
  USING (public.is_power_user_or_admin(auth.uid()));
