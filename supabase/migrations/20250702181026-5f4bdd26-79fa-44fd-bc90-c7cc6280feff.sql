-- Enhance analysis_rules table with additional fields for comprehensive rule management
ALTER TABLE public.analysis_rules ADD COLUMN IF NOT EXISTS rule_version INTEGER DEFAULT 1;
ALTER TABLE public.analysis_rules ADD COLUMN IF NOT EXISTS performance_metrics JSONB DEFAULT '{}';
ALTER TABLE public.analysis_rules ADD COLUMN IF NOT EXISTS last_executed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.analysis_rules ADD COLUMN IF NOT EXISTS execution_count INTEGER DEFAULT 0;
ALTER TABLE public.analysis_rules ADD COLUMN IF NOT EXISTS average_processing_time_ms INTEGER DEFAULT 0;
ALTER TABLE public.analysis_rules ADD COLUMN IF NOT EXISTS rule_template TEXT;
ALTER TABLE public.analysis_rules ADD COLUMN IF NOT EXISTS dependencies TEXT[];

-- Update existing analysis rules with enhanced configurations
UPDATE public.analysis_rules 
SET rule_config = jsonb_set(
  rule_config,
  '{enhanced_risk_assessment}',
  '{"multi_dimensional_scoring": true, "geographic_proximity_weight": 1.2, "personnel_impact_multiplier": 1.5, "time_decay_factor": 0.8, "source_reliability_weight": 1.1}'::jsonb
),
threshold_values = jsonb_set(
  threshold_values,
  '{risk_scoring}',
  '{"critical_threshold": 0.9, "high_threshold": 0.7, "medium_threshold": 0.4, "low_threshold": 0.2}'::jsonb
),
rule_template = 'enhanced_risk_assessment'
WHERE analysis_type = 'risk_assessment';

UPDATE public.analysis_rules
SET rule_config = jsonb_set(
  rule_config,
  '{advanced_correlation}',
  '{"multi_source_correlation": true, "geographic_clustering": true, "semantic_similarity": true, "temporal_correlation_window": 48, "confidence_boosting": true}'::jsonb
),
threshold_values = jsonb_set(
  threshold_values,
  '{correlation_thresholds}',
  '{"high_confidence": 0.8, "medium_confidence": 0.6, "low_confidence": 0.4, "geographic_radius_km": 150, "semantic_similarity_threshold": 0.7}'::jsonb
),
rule_template = 'advanced_correlation'
WHERE analysis_type = 'correlation';

UPDATE public.analysis_rules
SET rule_config = jsonb_set(
  rule_config,
  '{enhanced_trend_detection}',
  '{"pattern_recognition": true, "anomaly_detection": true, "seasonal_analysis": true, "predictive_modeling": true, "trend_confidence_scoring": true}'::jsonb
),
threshold_values = jsonb_set(
  threshold_values,
  '{trend_thresholds}',
  '{"pattern_strength": 0.7, "anomaly_threshold": 2.5, "trend_confidence": 0.8, "prediction_horizon_days": 14}'::jsonb
),
rule_template = 'enhanced_trend_detection'
WHERE analysis_type = 'trend_detection';

-- Insert new enhanced analysis rules
INSERT INTO public.analysis_rules (analysis_type, rule_config, threshold_values, rule_template) VALUES
('automated_scoring',
 '{"enable_automated_scoring": true, "scoring_algorithm": "weighted_composite", "real_time_updates": true, "score_normalization": true, "confidence_intervals": true, "historical_context": true}',
 '{"score_weights": {"severity": 0.3, "geographic_impact": 0.25, "personnel_count": 0.2, "source_reliability": 0.15, "time_relevance": 0.1}, "normalization_bounds": {"min": 0, "max": 10}, "confidence_threshold": 0.75}',
 'automated_scoring'
),
('alert_escalation',
 '{"enable_automated_escalation": true, "escalation_triggers": ["severity_increase", "geographic_expansion", "personnel_impact"], "notification_routing": true, "escalation_delays": {"level_1": 5, "level_2": 15, "level_3": 30}}',
 '{"escalation_thresholds": {"immediate": 0.9, "urgent": 0.7, "standard": 0.5}, "personnel_impact_threshold": 50, "geographic_expansion_threshold": 0.3}',
 'alert_escalation'
),
('quality_assurance',
 '{"enable_quality_scoring": true, "data_validation": true, "source_verification": true, "completeness_checking": true, "consistency_validation": true, "freshness_assessment": true}',
 '{"quality_score_threshold": 0.8, "completeness_threshold": 0.9, "freshness_threshold_hours": 24, "consistency_threshold": 0.85}',
 'quality_assurance'
),
('geographic_analysis',
 '{"enable_geographic_clustering": true, "proximity_analysis": true, "population_density_weighting": true, "administrative_boundary_awareness": true, "coordinate_validation": true}',
 '{"clustering_radius_km": 100, "population_density_weight": 1.3, "boundary_buffer_km": 25, "coordinate_precision_threshold": 0.001}',
 'geographic_analysis'
),
('temporal_analysis',
 '{"enable_temporal_patterns": true, "time_series_analysis": true, "seasonal_detection": true, "frequency_analysis": true, "duration_tracking": true}',
 '{"pattern_detection_window_days": 30, "seasonal_threshold": 0.6, "frequency_significance": 0.05, "duration_outlier_threshold": 2.0}',
 'temporal_analysis'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analysis_rules_template ON public.analysis_rules(rule_template);
CREATE INDEX IF NOT EXISTS idx_analysis_rules_performance ON public.analysis_rules(last_executed_at, execution_count);
CREATE INDEX IF NOT EXISTS idx_analysis_rules_active_type ON public.analysis_rules(analysis_type, is_active);

-- Create function to get analysis rules by template
CREATE OR REPLACE FUNCTION public.get_analysis_rules_by_template(template_name TEXT)
RETURNS TABLE(
  id UUID,
  analysis_type TEXT,
  rule_config JSONB,
  threshold_values JSONB,
  performance_metrics JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ar.id, ar.analysis_type, ar.rule_config, ar.threshold_values, ar.performance_metrics
  FROM public.analysis_rules ar
  WHERE ar.rule_template = template_name
    AND ar.is_active = true
  ORDER BY ar.analysis_type;
END;
$$;