
// Main entry point for config-driven normalization
export { 
  normalizeWithConfiguration, 
  normalizeAlertBatchWithConfig 
} from './config-driven/core-normalizer.ts';
export { 
  normalizeSeverity, 
  normalizeUrgency, 
  normalizeStatus, 
  normalizeDate, 
  getSourceName 
} from './config-driven/data-transformers.ts';
export { extractField, extractCoordinates } from './config-driven/field-extractor.ts';
