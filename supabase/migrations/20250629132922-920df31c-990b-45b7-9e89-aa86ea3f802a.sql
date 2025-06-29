
-- Create employee history tracking table
CREATE TABLE public.employee_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province_id UUID NOT NULL REFERENCES public.provinces(id) ON DELETE CASCADE,
  employee_count INTEGER NOT NULL,
  previous_count INTEGER,
  change_reason TEXT,
  changed_by TEXT, -- Could be 'admin', 'system', or specific user identifier
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_employee_history_province_id ON public.employee_history(province_id);
CREATE INDEX idx_employee_history_created_at ON public.employee_history(created_at DESC);

-- Create validation function for employee count changes
CREATE OR REPLACE FUNCTION validate_employee_count_change()
RETURNS TRIGGER AS $$
DECLARE
  old_count INTEGER;
  percentage_change DECIMAL;
BEGIN
  -- Get the previous count
  SELECT employee_count INTO old_count FROM public.provinces WHERE id = NEW.id;
  
  -- Skip validation for new records
  IF old_count IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Calculate percentage change
  IF old_count > 0 THEN
    percentage_change := ABS((NEW.employee_count - old_count)::DECIMAL / old_count * 100);
    
    -- Log warning for changes > 25%
    IF percentage_change > 25 THEN
      RAISE WARNING 'Large employee count change detected for province %: % to % (%.1f%% change)', 
        NEW.name, old_count, NEW.employee_count, percentage_change;
    END IF;
  END IF;
  
  -- Basic range validation
  IF NEW.employee_count < 0 OR NEW.employee_count > 100000 THEN
    RAISE EXCEPTION 'Invalid employee count: %. Must be between 0 and 100,000', NEW.employee_count;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
CREATE TRIGGER validate_employee_count_trigger
  BEFORE UPDATE ON public.provinces
  FOR EACH ROW
  EXECUTE FUNCTION validate_employee_count_change();

-- Create function to log employee count changes
CREATE OR REPLACE FUNCTION log_employee_count_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if employee_count actually changed
  IF OLD.employee_count IS DISTINCT FROM NEW.employee_count THEN
    INSERT INTO public.employee_history (
      province_id,
      employee_count,
      previous_count,
      change_reason,
      changed_by
    ) VALUES (
      NEW.id,
      NEW.employee_count,
      OLD.employee_count,
      'Manual update via admin interface',
      'admin'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for logging changes
CREATE TRIGGER log_employee_count_trigger
  AFTER UPDATE ON public.provinces
  FOR EACH ROW
  EXECUTE FUNCTION log_employee_count_change();

-- Enable RLS on employee_history table
ALTER TABLE public.employee_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for employee_history (allow read access to all authenticated users)
CREATE POLICY "Allow read access to employee history" 
  ON public.employee_history 
  FOR SELECT 
  TO authenticated 
  USING (true);
