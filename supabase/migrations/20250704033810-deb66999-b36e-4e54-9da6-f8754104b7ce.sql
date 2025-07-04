-- Step 1: Database Schema Improvements

-- Enhance travel_records table with better status tracking
ALTER TABLE public.travel_records 
ADD COLUMN location_status TEXT DEFAULT 'at_home' CHECK (location_status IN ('at_home', 'in_transit', 'at_destination', 'returning')),
ADD COLUMN approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'cancelled')),
ADD COLUMN approved_by UUID REFERENCES auth.users(id),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
ADD COLUMN compliance_notes TEXT,
ADD COLUMN last_location_update TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create travel_bookings table for automated platform integration
CREATE TABLE public.travel_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  travel_record_id UUID NOT NULL REFERENCES public.travel_records(id) ON DELETE CASCADE,
  booking_platform TEXT NOT NULL,
  external_booking_ref TEXT,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('flight', 'hotel', 'car', 'train', 'other')),
  departure_location TEXT,
  arrival_location TEXT,
  departure_time TIMESTAMP WITH TIME ZONE,
  arrival_time TIMESTAMP WITH TIME ZONE,
  booking_status TEXT DEFAULT 'confirmed' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  cost_amount DECIMAL(10,2),
  cost_currency TEXT DEFAULT 'CAD',
  booking_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create location_transitions table for audit trail
CREATE TABLE public.location_transitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  travel_record_id UUID REFERENCES public.travel_records(id),
  from_location_type TEXT NOT NULL CHECK (from_location_type IN ('hub', 'city', 'province')),
  from_location_id UUID NOT NULL,
  to_location_type TEXT NOT NULL CHECK (to_location_type IN ('hub', 'city', 'province')),
  to_location_id UUID NOT NULL,
  transition_type TEXT NOT NULL CHECK (transition_type IN ('travel_start', 'travel_end', 'location_change', 'manual_update')),
  transition_status TEXT DEFAULT 'pending' CHECK (transition_status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  scheduled_time TIMESTAMP WITH TIME ZONE,
  actual_time TIMESTAMP WITH TIME ZONE,
  initiated_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create travel_policies table for compliance checking
CREATE TABLE public.travel_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_name TEXT NOT NULL,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('approval', 'restriction', 'requirement', 'guideline')),
  applicable_locations TEXT[], -- Array of location patterns
  applicable_roles TEXT[], -- Array of employee roles
  policy_rules JSONB NOT NULL, -- Complex policy logic
  is_active BOOLEAN NOT NULL DEFAULT true,
  enforcement_level TEXT DEFAULT 'warning' CHECK (enforcement_level IN ('info', 'warning', 'blocking')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.travel_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for travel_bookings
CREATE POLICY "Authenticated users can view travel bookings" 
ON public.travel_bookings FOR SELECT 
USING (true);

CREATE POLICY "Power users can manage travel bookings" 
ON public.travel_bookings FOR ALL 
USING (is_power_user_or_admin());

-- RLS Policies for location_transitions
CREATE POLICY "Authenticated users can view location transitions" 
ON public.location_transitions FOR SELECT 
USING (true);

CREATE POLICY "Power users can manage location transitions" 
ON public.location_transitions FOR ALL 
USING (is_power_user_or_admin());

-- RLS Policies for travel_policies
CREATE POLICY "Authenticated users can view travel policies" 
ON public.travel_policies FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage travel policies" 
ON public.travel_policies FOR ALL 
USING (is_admin());

-- Create function to automatically update location counts when travel status changes
CREATE OR REPLACE FUNCTION public.sync_location_counts_on_travel_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- When travel status changes, update the relevant location counts
  IF OLD.travel_status IS DISTINCT FROM NEW.travel_status OR
     OLD.current_city_id IS DISTINCT FROM NEW.current_city_id THEN
    
    -- Log the transition
    INSERT INTO public.location_transitions (
      employee_id,
      travel_record_id,
      from_location_type,
      from_location_id,
      to_location_type,
      to_location_id,
      transition_type,
      transition_status,
      actual_time,
      notes
    ) VALUES (
      NEW.employee_id,
      NEW.id,
      'city',
      COALESCE(OLD.current_city_id, NEW.home_city_id),
      'city',
      COALESCE(NEW.current_city_id, NEW.home_city_id),
      CASE 
        WHEN NEW.travel_status = 'traveling' THEN 'travel_start'
        WHEN NEW.travel_status = 'at_destination' THEN 'location_change'
        WHEN NEW.travel_status = 'home' THEN 'travel_end'
        ELSE 'manual_update'
      END,
      'completed',
      now(),
      'Automated transition from travel status change'
    );
    
    -- Update hub employee location counts if this affects a hub
    -- This will be handled by the hub sync triggers
    
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for travel status changes
CREATE TRIGGER sync_location_counts_on_travel_change
AFTER UPDATE ON public.travel_records
FOR EACH ROW
EXECUTE FUNCTION public.sync_location_counts_on_travel_change();

-- Create function to validate travel policy compliance
CREATE OR REPLACE FUNCTION public.validate_travel_compliance(
  employee_id TEXT,
  destination_city_id UUID,
  travel_start_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE(
  is_compliant BOOLEAN,
  policy_violations JSONB,
  recommendations JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  violations JSONB := '[]'::JSONB;
  recommendations JSONB := '[]'::JSONB;
  policy_record RECORD;
BEGIN
  -- Check each active travel policy
  FOR policy_record IN 
    SELECT * FROM public.travel_policies 
    WHERE is_active = true
  LOOP
    -- This is a simplified validation - in practice, you'd implement
    -- complex policy logic based on the policy_rules JSONB
    
    -- Example: Check if advance booking requirement is met
    IF policy_record.policy_type = 'requirement' AND
       policy_record.policy_rules->>'advance_booking_days' IS NOT NULL THEN
      
      IF travel_start_date < now() + INTERVAL '1 day' * (policy_record.policy_rules->>'advance_booking_days')::INTEGER THEN
        violations := violations || jsonb_build_object(
          'policy_id', policy_record.id,
          'policy_name', policy_record.policy_name,
          'violation', 'Insufficient advance booking time',
          'enforcement_level', policy_record.enforcement_level
        );
      END IF;
    END IF;
  END LOOP;
  
  -- Return compliance status
  RETURN QUERY SELECT 
    (jsonb_array_length(violations) = 0) as is_compliant,
    violations as policy_violations,
    recommendations;
END;
$function$;