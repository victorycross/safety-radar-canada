
import { UniversalAlert } from '../alert-types.ts';
import { SourceConfiguration } from './types.ts';
import { normalizeWithConfiguration } from './single-normalizer.ts';

export function normalizeAlertBatchWithConfig(
  alerts: any[],
  config: SourceConfiguration,
  sourceType: string
): UniversalAlert[] {
  return alerts.map(alert => {
    try {
      return normalizeWithConfiguration(alert, config, sourceType);
    } catch (error) {
      console.error(`Error normalizing alert with config:`, error);
      
      // Return minimal valid alert on error
      return {
        id: `error-${Date.now()}`,
        title: 'Alert Processing Error',
        description: 'Failed to process alert data',
        severity: 'Unknown' as const,
        urgency: 'Unknown' as const,
        category: 'Error',
        status: 'Unknown' as const,
        area: 'Unknown',
        published: new Date().toISOString(),
        source: 'Other' as const
      };
    }
  });
}
