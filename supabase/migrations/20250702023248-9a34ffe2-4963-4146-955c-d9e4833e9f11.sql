
-- Create organizations table for multi-tenant support
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  contact_email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscription_tier TEXT NOT NULL DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'standard', 'premium', 'enterprise')),
  max_users INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI configurations table
CREATE TABLE public.ai_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'azure')),
  api_key_encrypted TEXT NOT NULL,
  model_name TEXT NOT NULL,
  feature_flags JSONB NOT NULL DEFAULT '{}',
  cost_limits JSONB NOT NULL DEFAULT '{"daily_limit": 100, "monthly_limit": 1000}',
  usage_stats JSONB NOT NULL DEFAULT '{"requests_today": 0, "requests_month": 0, "cost_today": 0, "cost_month": 0}',
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, provider)
);

-- Add organization_id to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to profiles table  
ALTER TABLE public.profiles
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Create RLS policies for organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization"
  ON public.organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage organizations"
  ON public.organizations FOR ALL
  USING (is_admin());

-- Create RLS policies for AI configurations
ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can manage AI configs"
  ON public.ai_configurations FOR ALL
  USING (
    organization_id IN (
      SELECT p.organization_id 
      FROM public.profiles p 
      JOIN public.user_roles ur ON p.id = ur.user_id 
      WHERE p.id = auth.uid() 
      AND (ur.role = 'admin' OR ur.role = 'power_user')
      AND ur.organization_id = organization_id
    )
  );

CREATE POLICY "Org members can view AI configs"
  ON public.ai_configurations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Create function to get organization AI config
CREATE OR REPLACE FUNCTION public.get_organization_ai_config(org_id UUID, ai_provider TEXT)
RETURNS TABLE(
  id UUID,
  provider TEXT,
  model_name TEXT,
  feature_flags JSONB,
  cost_limits JSONB,
  usage_stats JSONB,
  is_enabled BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ac.id,
    ac.provider,
    ac.model_name,
    ac.feature_flags,
    ac.cost_limits,
    ac.usage_stats,
    ac.is_enabled
  FROM public.ai_configurations ac
  WHERE ac.organization_id = org_id 
    AND ac.provider = ai_provider
    AND ac.is_enabled = true;
END;
$$;

-- Create function to update AI usage stats
CREATE OR REPLACE FUNCTION public.update_ai_usage_stats(
  config_id UUID,
  requests_increment INTEGER DEFAULT 1,
  cost_increment DECIMAL DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.ai_configurations
  SET 
    usage_stats = jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            usage_stats,
            '{requests_today}',
            ((usage_stats->>'requests_today')::INTEGER + requests_increment)::TEXT::JSONB
          ),
          '{requests_month}',
          ((usage_stats->>'requests_month')::INTEGER + requests_increment)::TEXT::JSONB
        ),
        '{cost_today}',
        ((usage_stats->>'cost_today')::DECIMAL + cost_increment)::TEXT::JSONB
      ),
      '{cost_month}',
      ((usage_stats->>'cost_month')::DECIMAL + cost_increment)::TEXT::JSONB
    ),
    updated_at = now()
  WHERE id = config_id;
END;
$$;

-- Insert default organization for existing users
INSERT INTO public.organizations (name, slug, description, contact_email, subscription_tier)
VALUES ('Default Organization', 'default-org', 'Default organization for existing users', 'admin@example.com', 'enterprise');

-- Update existing profiles to link to default organization
UPDATE public.profiles 
SET organization_id = (SELECT id FROM public.organizations WHERE slug = 'default-org')
WHERE organization_id IS NULL;

-- Update existing user_roles to link to default organization
UPDATE public.user_roles 
SET organization_id = (SELECT id FROM public.organizations WHERE slug = 'default-org')
WHERE organization_id IS NULL;
