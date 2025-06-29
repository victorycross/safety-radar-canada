
// Universal alert interface that all sources will normalize to
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

// Validation result interface
export interface AlertValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Batch processing result interface
export interface AlertBatchResult {
  totalAlerts: number;
  validAlerts: number;
  invalidAlerts: number;
  errors: string[];
  warnings: string[];
}
