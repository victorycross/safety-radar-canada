-- Create staff incident reports table for pending reports that need review
CREATE TABLE public.staff_incident_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  province_id UUID NOT NULL REFERENCES public.provinces(id),
  alert_level TEXT NOT NULL DEFAULT 'warning',
  
  -- Staff submission info
  submitted_by TEXT,
  contact_info TEXT NOT NULL,
  anonymous BOOLEAN DEFAULT false,
  submission_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tracking_number TEXT NOT NULL,
  
  -- Review workflow
  review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  
  -- Additional metadata
  raw_form_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique tracking number constraint
CREATE UNIQUE INDEX staff_incident_reports_tracking_number_idx ON public.staff_incident_reports(tracking_number);

-- Enable RLS
ALTER TABLE public.staff_incident_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can submit staff incident reports" 
ON public.staff_incident_reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view their own submitted reports" 
ON public.staff_incident_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Power users can manage staff incident reports" 
ON public.staff_incident_reports 
FOR ALL 
USING (is_power_user_or_admin());

-- Function to generate tracking numbers
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'SIR-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(EXTRACT(EPOCH FROM now())::TEXT, 10, '0');
END;
$$;

-- Trigger to auto-generate tracking numbers
CREATE OR REPLACE FUNCTION public.set_tracking_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tracking_number IS NULL OR NEW.tracking_number = '' THEN
    NEW.tracking_number := public.generate_tracking_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_tracking_number_trigger
  BEFORE INSERT ON public.staff_incident_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_tracking_number();

-- Function to approve staff report and create incident
CREATE OR REPLACE FUNCTION public.approve_staff_incident_report(
  report_id UUID,
  reviewer_id UUID,
  review_notes_text TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  report_record RECORD;
  new_incident_id UUID;
BEGIN
  -- Get the staff report
  SELECT * INTO report_record FROM public.staff_incident_reports WHERE id = report_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Staff incident report not found';
  END IF;
  
  IF report_record.review_status != 'pending' THEN
    RAISE EXCEPTION 'Report has already been reviewed';
  END IF;
  
  -- Create incident from approved staff report
  INSERT INTO public.incidents (
    title,
    description,
    province_id,
    alert_level,
    source,
    verification_status,
    recommended_action
  ) VALUES (
    report_record.title,
    report_record.description,
    report_record.province_id,
    report_record.alert_level,
    'staff_reported',
    'verified',
    'Review submitted staff incident report'
  ) RETURNING id INTO new_incident_id;
  
  -- Update staff report status
  UPDATE public.staff_incident_reports 
  SET 
    review_status = 'approved',
    reviewed_by = reviewer_id,
    reviewed_at = now(),
    review_notes = review_notes_text,
    updated_at = now()
  WHERE id = report_id;
  
  RETURN new_incident_id;
END;
$$;

-- Function to reject staff report
CREATE OR REPLACE FUNCTION public.reject_staff_incident_report(
  report_id UUID,
  reviewer_id UUID,
  review_notes_text TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.staff_incident_reports 
  SET 
    review_status = 'rejected',
    reviewed_by = reviewer_id,
    reviewed_at = now(),
    review_notes = review_notes_text,
    updated_at = now()
  WHERE id = report_id AND review_status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Staff incident report not found or already reviewed';
  END IF;
  
  RETURN true;
END;
$$;