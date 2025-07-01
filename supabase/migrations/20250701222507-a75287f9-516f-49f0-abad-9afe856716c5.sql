
-- Create a communication templates table
CREATE TABLE public.communication_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'push')),
  subject TEXT,
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add Row Level Security
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for communication templates
CREATE POLICY "Admin and power users can manage communication templates" 
  ON public.communication_templates 
  FOR ALL 
  USING (is_power_user_or_admin(auth.uid()))
  WITH CHECK (is_power_user_or_admin(auth.uid()));

CREATE POLICY "Admin and power users can view communication templates" 
  ON public.communication_templates 
  FOR SELECT 
  USING (is_power_user_or_admin(auth.uid()));
