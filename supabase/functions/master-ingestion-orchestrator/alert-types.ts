
// Types for alert normalization - duplicated from src/types/alerts.ts for edge function use
export interface UniversalAlert {
  id: string;
  title: string;
  description: string;
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Info' | 'Unknown';
  urgency: 'Immediate' | 'Expected' | 'Future' | 'Past' | 'Unknown';
  category: string;
  status: 'Actual' | 'Exercise' | 'System' | 'Test' | 'Draft' | 'Unknown';
  area: string;
  published: string;
  updated?: string;
  expires?: string;
  effective?: string;
  url?: string;
  instructions?: string;
  author?: string;
  source: 'Alert Ready' | 'BC Emergency' | 'Everbridge' | 'Other';
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface AlertNormalizationResult {
  alerts: UniversalAlert[];
  errors: string[];
  processingStats: {
    total: number;
    successful: number;
    failed: number;
  };
}
