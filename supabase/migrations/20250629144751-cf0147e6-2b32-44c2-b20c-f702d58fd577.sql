
-- Phase 1: Create User Role System
CREATE TYPE public.app_role AS ENUM ('admin', 'power_user', 'regular_user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper function to check if user has admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Helper function to check if user has power_user or admin role
CREATE OR REPLACE FUNCTION public.is_power_user_or_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'power_user')
$$;

-- Create profiles table for user management
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  
  -- Assign default role (regular_user)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'regular_user');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile and assign role on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Phase 2: Update RLS Policies by Security Level

-- PROFILES TABLE POLICIES
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- USER_ROLES TABLE POLICIES
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_admin());

-- PROVINCES TABLE POLICIES (Public read, admin write)
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view provinces" ON public.provinces
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage provinces" ON public.provinces
  FOR ALL USING (public.is_admin());

-- CITIES TABLE POLICIES (Authenticated read, power_user+ write)
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view cities" ON public.cities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Power users can manage cities" ON public.cities
  FOR ALL USING (public.is_power_user_or_admin());

-- EMPLOYEE_LOCATIONS TABLE POLICIES (Authenticated read, power_user+ write)
ALTER TABLE public.employee_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view employee locations" ON public.employee_locations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Power users can manage employee locations" ON public.employee_locations
  FOR ALL USING (public.is_power_user_or_admin());

-- TRAVEL_RECORDS TABLE POLICIES (Replace existing with role-based)
DROP POLICY IF EXISTS "Allow authenticated users to insert travel records" ON public.travel_records;
DROP POLICY IF EXISTS "Allow authenticated users to update travel records" ON public.travel_records;
DROP POLICY IF EXISTS "Allow authenticated users to delete travel records" ON public.travel_records;

CREATE POLICY "Power users can view travel records" ON public.travel_records
  FOR SELECT USING (public.is_power_user_or_admin());

CREATE POLICY "Power users can manage travel records" ON public.travel_records
  FOR ALL USING (public.is_power_user_or_admin());

-- TRAVEL_INTEGRATION_CONFIG TABLE POLICIES (Admin only)
ALTER TABLE public.travel_integration_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage travel integration config" ON public.travel_integration_config
  FOR ALL USING (public.is_admin());

-- INCIDENTS TABLE POLICIES (Authenticated read, power_user+ write)
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view incidents" ON public.incidents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Power users can manage incidents" ON public.incidents
  FOR ALL USING (public.is_power_user_or_admin());

-- ALERT_SOURCES TABLE POLICIES (Admin only)
ALTER TABLE public.alert_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage alert sources" ON public.alert_sources
  FOR ALL USING (public.is_admin());

-- SOURCE_HEALTH_METRICS TABLE POLICIES (Admin only)
ALTER TABLE public.source_health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view health metrics" ON public.source_health_metrics
  FOR SELECT USING (public.is_admin());

CREATE POLICY "System can insert health metrics" ON public.source_health_metrics
  FOR INSERT WITH CHECK (true);

-- HISTORY TABLES POLICIES (Authenticated read, admin write)
ALTER TABLE public.employee_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view employee history" ON public.employee_history
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage employee history" ON public.employee_history
  FOR ALL USING (public.is_admin());

CREATE POLICY "Authenticated users can view location history" ON public.location_history
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Power users can insert location history" ON public.location_history
  FOR INSERT WITH CHECK (public.is_power_user_or_admin());

-- INGESTION TABLES POLICIES (Admin only for management)
ALTER TABLE public.alert_ingestion_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geospatial_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage alert ingestion queue" ON public.alert_ingestion_queue
  FOR ALL USING (public.is_admin());

CREATE POLICY "Authenticated users can view correlations" ON public.alert_correlations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Power users can manage correlations" ON public.alert_correlations
  FOR ALL USING (public.is_power_user_or_admin());

CREATE POLICY "Authenticated users can view geospatial data" ON public.geospatial_data
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Power users can manage geospatial data" ON public.geospatial_data
  FOR ALL USING (public.is_power_user_or_admin());

-- Create function to assign admin role (for initial setup)
CREATE OR REPLACE FUNCTION public.make_user_admin(_user_email TEXT)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  _user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO _user_id FROM auth.users WHERE email = _user_email;
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', _user_email;
  END IF;
  
  -- Insert admin role (or update if exists)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
