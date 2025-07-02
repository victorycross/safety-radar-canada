-- Create data processing configuration tables

-- Main configuration table for data processing settings
CREATE TABLE public.data_processing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'normalization', 'classification', 'analysis', 'security', 'quality_control'
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 100, -- Higher priority rules execute first
  config_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Field mapping rules for normalization
CREATE TABLE public.normalization_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL, -- 'rss', 'weather', 'immigration', etc.
  field_mappings JSONB NOT NULL, -- Maps source fields to normalized fields
  transformation_rules JSONB, -- Text cleaning, format conversion rules
  severity_mapping JSONB, -- Custom severity classifications
  category_mapping JSONB, -- Category classifications
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Classification rules for severity and impact assessment
CREATE TABLE public.classification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type TEXT NOT NULL, -- 'severity', 'category', 'personnel_impact'
  condition_pattern TEXT NOT NULL, -- Regex or keyword pattern to match
  classification_value TEXT NOT NULL, -- The classification to assign
  confidence_score NUMERIC DEFAULT 1.0,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 100,
  source_types TEXT[], -- Which source types this rule applies to
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Analysis configuration for risk assessment and correlation
CREATE TABLE public.analysis_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_type TEXT NOT NULL, -- 'risk_assessment', 'correlation', 'trend_detection'
  rule_config JSONB NOT NULL, -- Configuration parameters for the analysis
  threshold_values JSONB, -- Various thresholds and limits
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Quality control validation rules
CREATE TABLE public.quality_control_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  validation_type TEXT NOT NULL, -- 'required_fields', 'format_validation', 'duplicate_detection'
  validation_config JSONB NOT NULL, -- Validation parameters
  error_handling JSONB, -- How to handle validation failures
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on all configuration tables
ALTER TABLE public.data_processing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.normalization_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_control_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies - only admins can manage rules, power users can view
CREATE POLICY "Admins can manage data processing config" ON public.data_processing_config
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Power users can view data processing config" ON public.data_processing_config
  FOR SELECT USING (is_power_user_or_admin());

CREATE POLICY "Admins can manage normalization rules" ON public.normalization_rules
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Power users can view normalization rules" ON public.normalization_rules
  FOR SELECT USING (is_power_user_or_admin());

CREATE POLICY "Admins can manage classification rules" ON public.classification_rules
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Power users can view classification rules" ON public.classification_rules
  FOR SELECT USING (is_power_user_or_admin());

CREATE POLICY "Admins can manage analysis rules" ON public.analysis_rules
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Power users can view analysis rules" ON public.analysis_rules
  FOR SELECT USING (is_power_user_or_admin());

CREATE POLICY "Admins can manage quality control rules" ON public.quality_control_rules
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Power users can view quality control rules" ON public.quality_control_rules
  FOR SELECT USING (is_power_user_or_admin());

-- Create indexes for performance
CREATE INDEX idx_data_processing_config_category ON public.data_processing_config(category);
CREATE INDEX idx_data_processing_config_active ON public.data_processing_config(is_active);
CREATE INDEX idx_normalization_rules_source_type ON public.normalization_rules(source_type);
CREATE INDEX idx_normalization_rules_active ON public.normalization_rules(is_active);
CREATE INDEX idx_classification_rules_type ON public.classification_rules(rule_type);
CREATE INDEX idx_classification_rules_active ON public.classification_rules(is_active);
CREATE INDEX idx_analysis_rules_type ON public.analysis_rules(analysis_type);
CREATE INDEX idx_quality_control_rules_type ON public.quality_control_rules(validation_type);

-- Insert default Canadian government processing rules
INSERT INTO public.normalization_rules (source_type, field_mappings, transformation_rules, severity_mapping, category_mapping) VALUES
-- RSS/Security feeds
('rss', 
 '{"title": "title", "description": "summary", "published": "pub_date", "url": "link", "category": "category"}',
 '{"text_cleaning": ["remove_html", "normalize_whitespace", "clean_government_prefixes"], "title_patterns": ["^(Advisory|Alert|Warning|Notice|Bulletin|Update):\\\\s*", "\\\\s*-\\\\s*(Government of Canada|Canada\\\\.ca)$"], "description_limits": {"max_length": 500}}',
 '{"critical": "Extreme", "high": "Severe", "medium": "Moderate", "low": "Minor", "info": "Info"}',
 '{"cybersecurity": "Security", "emergency": "Emergency", "weather": "Weather", "travel": "Travel", "health": "Health"}'
),
-- Weather feeds
('weather',
 '{"title": "description", "description": "description", "severity": "severity", "published": "onset", "expires": "expires", "coordinates": "geometry_coordinates"}',
 '{"severity_keywords": {"extreme": ["tornado", "hurricane", "tsunami"], "severe": ["severe thunderstorm", "blizzard", "ice storm"], "moderate": ["weather warning", "special weather statement"]}}',
 '{"extreme": "Extreme", "severe": "Severe", "moderate": "Moderate", "minor": "Minor"}',
 '{"weather": "Weather", "storm": "Severe Weather", "advisory": "Weather Advisory"}'
),
-- Immigration/Travel feeds
('immigration-travel-atom',
 '{"title": "title", "description": "content", "published": "pub_date", "category": "announcement_type", "url": "link"}',
 '{"bilingual_handling": true, "government_source_cleaning": true}',
 '{"urgent": "Severe", "important": "Moderate", "routine": "Minor"}',
 '{"travel": "Travel", "immigration": "Immigration", "border": "Border Services", "visa": "Visa Services"}'
);

-- Insert default classification rules for Canadian content
INSERT INTO public.classification_rules (rule_type, condition_pattern, classification_value, confidence_score, source_types) VALUES
-- Severity classification based on content
('severity', '\\b(extreme|critical|emergency|catastrophic|tornado|hurricane|tsunami|terrorist)\\b', 'Extreme', 0.9, ARRAY['rss', 'weather', 'immigration-travel-atom']),
('severity', '\\b(severe|major|high|warning|alert|evacuation|shelter|lockdown)\\b', 'Severe', 0.8, ARRAY['rss', 'weather', 'immigration-travel-atom']),
('severity', '\\b(moderate|medium|watch|advisory|caution|prepare)\\b', 'Moderate', 0.7, ARRAY['rss', 'weather', 'immigration-travel-atom']),
('severity', '\\b(minor|low|notice|update|information|routine)\\b', 'Minor', 0.6, ARRAY['rss', 'weather', 'immigration-travel-atom']),
('severity', '\\b(info|information|informational|announcement|bulletin)\\b', 'Info', 0.5, ARRAY['rss', 'weather', 'immigration-travel-atom']),

-- Category classification
('category', '\\b(cyber|security|attack|breach|threat|malware|phishing|ransomware)\\b', 'Cybersecurity', 0.9, ARRAY['rss']),
('category', '\\b(emergency|disaster|evacuation|shelter|fire|flood|earthquake)\\b', 'Emergency', 0.9, ARRAY['rss', 'weather']),
('category', '\\b(health|disease|outbreak|pandemic|medical|vaccine|illness)\\b', 'Health', 0.8, ARRAY['rss', 'immigration-travel-atom']),
('category', '\\b(weather|storm|tornado|hurricane|blizzard|warning|watch)\\b', 'Weather', 0.9, ARRAY['weather']),
('category', '\\b(travel|immigration|visa|passport|border|advisory)\\b', 'Travel', 0.8, ARRAY['immigration-travel-atom']),
('category', '\\b(government|service|announcement|policy|regulation)\\b', 'Government', 0.7, ARRAY['rss', 'immigration-travel-atom']);

-- Insert default analysis rules
INSERT INTO public.analysis_rules (analysis_type, rule_config, threshold_values) VALUES
('risk_assessment', 
 '{"enable_automated_scoring": true, "consider_severity": true, "consider_location": true, "consider_personnel_impact": true}',
 '{"high_risk_threshold": 0.8, "medium_risk_threshold": 0.5, "personnel_impact_multiplier": 1.5}'
),
('correlation', 
 '{"enable_correlation": true, "time_window_hours": 24, "location_radius_km": 100, "similarity_threshold": 0.7}',
 '{"max_correlations_per_alert": 5, "confidence_threshold": 0.6}'
),
('trend_detection',
 '{"enable_trend_analysis": true, "analysis_window_days": 7, "trend_threshold": 0.3}',
 '{"minimum_alerts_for_trend": 3, "trend_confidence_threshold": 0.7}'
);

-- Insert default quality control rules
INSERT INTO public.quality_control_rules (validation_type, validation_config, error_handling) VALUES
('required_fields',
 '{"required": ["title", "description", "published", "source"], "conditional_required": {"weather": ["severity", "event_type"], "security": ["category"]}}',
 '{"on_missing_required": "log_warning", "on_missing_conditional": "use_default"}'
),
('format_validation',
 '{"date_formats": ["ISO8601", "RFC2822"], "url_validation": true, "coordinate_validation": true}',
 '{"on_invalid_date": "use_current_time", "on_invalid_url": "remove_url", "on_invalid_coordinates": "remove_coordinates"}'
),
('duplicate_detection',
 '{"check_duplicate_urls": true, "check_similar_titles": true, "similarity_threshold": 0.9, "time_window_hours": 48}',
 '{"on_duplicate": "skip_processing", "on_similar": "log_info"}'
),
('text_quality',
 '{"min_title_length": 5, "max_title_length": 200, "min_description_length": 10, "check_encoding": true}',
 '{"on_short_title": "use_source_default", "on_long_title": "truncate", "on_encoding_error": "clean_text"}'
);

-- Create function to get active rules by category
CREATE OR REPLACE FUNCTION public.get_active_processing_rules(rule_category TEXT)
RETURNS TABLE(
  id UUID,
  name TEXT,
  config_data JSONB,
  priority INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT dpc.id, dpc.name, dpc.config_data, dpc.priority
  FROM public.data_processing_config dpc
  WHERE dpc.category = rule_category
    AND dpc.is_active = true
  ORDER BY dpc.priority DESC, dpc.created_at ASC;
END;
$$;