
-- PHASE 1: EMERGENCY SECURITY CLEANUP (Updated with proper IF EXISTS checks)
-- Remove conflicting public access policies and fix authentication requirements

-- 1. Drop conflicting public policies on sensitive tables
DROP POLICY IF EXISTS "Allow public read access to alert_sources" ON public.alert_sources;
DROP POLICY IF EXISTS "Allow public read access to source_health_metrics" ON public.source_health_metrics;
DROP POLICY IF EXISTS "Allow public read access to alert_ingestion_queue" ON public.alert_ingestion_queue;
DROP POLICY IF EXISTS "Allow public read access to alert_correlations" ON public.alert_correlations;
DROP POLICY IF EXISTS "Allow public read access to geospatial_data" ON public.geospatial_data;

-- 2. Drop existing inconsistent policies on provinces and cities
DROP POLICY IF EXISTS "Anyone can view provinces" ON public.provinces;
DROP POLICY IF EXISTS "Public can view provinces" ON public.provinces;
DROP POLICY IF EXISTS "Admins can manage provinces" ON public.provinces;
DROP POLICY IF EXISTS "Authenticated users can view cities" ON public.cities;
DROP POLICY IF EXISTS "Public can view cities" ON public.cities;
DROP POLICY IF EXISTS "Power users can manage cities" ON public.cities;
DROP POLICY IF EXISTS "Admins can manage cities" ON public.cities;

-- 3. Drop existing travel and employee policies to rebuild them consistently
DROP POLICY IF EXISTS "Power users can view travel records" ON public.travel_records;
DROP POLICY IF EXISTS "Power users can manage travel records" ON public.travel_records;
DROP POLICY IF EXISTS "Power users can update travel records" ON public.travel_records;
DROP POLICY IF EXISTS "Power users can delete travel records" ON public.travel_records;
DROP POLICY IF EXISTS "Authenticated users can view employee locations" ON public.employee_locations;
DROP POLICY IF EXISTS "Power users can manage employee locations" ON public.employee_locations;

-- 4. Drop existing incident and correlation policies
DROP POLICY IF EXISTS "Authenticated users can view incidents" ON public.incidents;
DROP POLICY IF EXISTS "Power users can manage incidents" ON public.incidents;
DROP POLICY IF EXISTS "Authenticated users can view alert correlations" ON public.alert_correlations;
DROP POLICY IF EXISTS "Power users can manage alert correlations" ON public.alert_correlations;

-- 5. Drop existing geospatial and history policies
DROP POLICY IF EXISTS "Authenticated users can view geospatial data" ON public.geospatial_data;
DROP POLICY IF EXISTS "Power users can manage geospatial data" ON public.geospatial_data;
DROP POLICY IF EXISTS "Authenticated users can view employee history" ON public.employee_history;
DROP POLICY IF EXISTS "Authenticated users can view location history" ON public.location_history;
DROP POLICY IF EXISTS "Power users can insert location history" ON public.location_history;
DROP POLICY IF EXISTS "Admins can manage employee history" ON public.employee_history;

-- 6. Drop existing admin policies
DROP POLICY IF EXISTS "Admins can view alert sources" ON public.alert_sources;
DROP POLICY IF EXISTS "Admins can manage alert sources" ON public.alert_sources;
DROP POLICY IF EXISTS "Admins can view source health metrics" ON public.source_health_metrics;
DROP POLICY IF EXISTS "System can insert health metrics" ON public.source_health_metrics;
DROP POLICY IF EXISTS "Admins can manage alert ingestion queue" ON public.alert_ingestion_queue;
DROP POLICY IF EXISTS "Admins can manage travel integration config" ON public.travel_integration_config;

-- 7. Drop existing user management policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- PHASE 2: IMPLEMENT STANDARDIZED ROLE-BASED POLICIES

-- TIER 1: PUBLIC DATA (No authentication required)
-- Provinces - Basic information for public dashboard
CREATE POLICY "Public can view provinces" ON public.provinces
  FOR SELECT USING (true);

-- Cities - Basic geographic information
CREATE POLICY "Public can view cities" ON public.cities
  FOR SELECT USING (true);

-- TIER 2: AUTHENTICATED USER ACCESS (Regular users)
-- Incidents - Authenticated users can view security incidents
CREATE POLICY "Authenticated users can view incidents" ON public.incidents
  FOR SELECT TO authenticated USING (true);

-- Alert correlations - Authenticated users can view correlations
CREATE POLICY "Authenticated users can view alert correlations" ON public.alert_correlations
  FOR SELECT TO authenticated USING (true);

-- Geospatial data - Authenticated users can view location data
CREATE POLICY "Authenticated users can view geospatial data" ON public.geospatial_data
  FOR SELECT TO authenticated USING (true);

-- Employee locations - Authenticated users can view employee distribution
CREATE POLICY "Authenticated users can view employee locations" ON public.employee_locations
  FOR SELECT TO authenticated USING (true);

-- History tables - Authenticated users can view historical data
CREATE POLICY "Authenticated users can view employee history" ON public.employee_history
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view location history" ON public.location_history
  FOR SELECT TO authenticated USING (true);

-- TIER 3: POWER USER ACCESS (Power users and admins)
-- Incidents - Power users can manage incidents
CREATE POLICY "Power users can manage incidents" ON public.incidents
  FOR ALL TO authenticated USING (public.is_power_user_or_admin());

-- Employee locations - Power users can manage employee data
CREATE POLICY "Power users can manage employee locations" ON public.employee_locations
  FOR ALL TO authenticated USING (public.is_power_user_or_admin());

-- Travel records - Power users can manage travel data
CREATE POLICY "Power users can view travel records" ON public.travel_records
  FOR SELECT TO authenticated USING (public.is_power_user_or_admin());

CREATE POLICY "Power users can manage travel records" ON public.travel_records
  FOR INSERT TO authenticated WITH CHECK (public.is_power_user_or_admin());

CREATE POLICY "Power users can update travel records" ON public.travel_records
  FOR UPDATE TO authenticated USING (public.is_power_user_or_admin());

CREATE POLICY "Power users can delete travel records" ON public.travel_records
  FOR DELETE TO authenticated USING (public.is_power_user_or_admin());

-- Alert correlations - Power users can manage correlations
CREATE POLICY "Power users can manage alert correlations" ON public.alert_correlations
  FOR ALL TO authenticated USING (public.is_power_user_or_admin());

-- Geospatial data - Power users can manage geospatial data
CREATE POLICY "Power users can manage geospatial data" ON public.geospatial_data
  FOR ALL TO authenticated USING (public.is_power_user_or_admin());

-- Location history - Power users can insert location changes
CREATE POLICY "Power users can insert location history" ON public.location_history
  FOR INSERT TO authenticated WITH CHECK (public.is_power_user_or_admin());

-- TIER 4: ADMIN-ONLY ACCESS
-- Provinces - Admins can modify province data
CREATE POLICY "Admins can manage provinces" ON public.provinces
  FOR ALL TO authenticated USING (public.is_admin());

-- Cities - Admins can manage city data
CREATE POLICY "Admins can manage cities" ON public.cities
  FOR ALL TO authenticated USING (public.is_admin());

-- Alert sources - Admins can manage data sources
CREATE POLICY "Admins can view alert sources" ON public.alert_sources
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can manage alert sources" ON public.alert_sources
  FOR ALL TO authenticated USING (public.is_admin());

-- Source health metrics - Admins can view system health
CREATE POLICY "Admins can view source health metrics" ON public.source_health_metrics
  FOR SELECT TO authenticated USING (public.is_admin());

-- System can insert health metrics (for automated monitoring)
CREATE POLICY "System can insert health metrics" ON public.source_health_metrics
  FOR INSERT WITH CHECK (true);

-- Alert ingestion queue - Admins can manage ingestion pipeline
CREATE POLICY "Admins can manage alert ingestion queue" ON public.alert_ingestion_queue
  FOR ALL TO authenticated USING (public.is_admin());

-- Travel integration config - Admins can manage integrations
CREATE POLICY "Admins can manage travel integration config" ON public.travel_integration_config
  FOR ALL TO authenticated USING (public.is_admin());

-- Employee history - Admins can manage historical records
CREATE POLICY "Admins can manage employee history" ON public.employee_history
  FOR ALL TO authenticated USING (public.is_admin());

-- PHASE 3: USER MANAGEMENT POLICIES
-- User roles - Users can view their own roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admins can manage all user roles
CREATE POLICY "Admins can manage all user roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_admin());

-- Profiles - Users can view and update their own profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_admin());

-- VERIFICATION: Create a function to test policy coverage
CREATE OR REPLACE FUNCTION public.verify_rls_coverage()
RETURNS TABLE(
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::TEXT,
    t.rowsecurity,
    COUNT(p.policyname)
  FROM pg_tables t
  LEFT JOIN pg_policies p ON t.tablename = p.tablename
  WHERE t.schemaname = 'public'
    AND t.tablename NOT LIKE '%_test%'
  GROUP BY t.tablename, t.rowsecurity
  ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql;
