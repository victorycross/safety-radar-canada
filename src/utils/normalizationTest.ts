
import { UniversalAlert } from '@/types/alerts';
import { normalizeAlert } from './sourceNormalizers';
import { validateUniversalAlert } from './alertValidation';

// Test data for different source formats
const testAlerts = {
  alertReady: {
    id: 'test-alert-ready-1',
    title: 'Test Alert Ready Alert',
    summary: 'This is a test alert from Alert Ready',
    severity: 'Severe',
    urgency: 'Immediate',
    category: 'Weather',
    status: 'Actual',
    area: 'Ontario',
    published: '2024-01-01T12:00:00Z',
    url: 'https://example.com/alert',
    instructions: 'Take immediate action'
  },
  bc: {
    id: 'test-bc-1',
    properties: {
      title: 'BC Emergency Alert',
      description: 'Test BC emergency alert',
      severity: 'EXTREME',
      urgency: 'IMMEDIATE',
      category: 'Emergency',
      status: 'ACTUAL',
      area: 'British Columbia',
      published: '2024-01-01T12:00:00Z'
    }
  },
  everbridge: {
    id: 'test-everbridge-1',
    subject: 'Everbridge Notification',
    message: 'Test Everbridge alert message',
    priority: 'high',
    immediacy: 'immediate',
    type: 'Notification',
    status: 'active',
    location: 'Vancouver',
    timestamp: '2024-01-01T12:00:00Z'
  }
};

// Test normalization consistency
export const testNormalization = (): {
  success: boolean;
  results: Array<{
    source: string;
    normalized: UniversalAlert;
    validation: any;
    issues: string[];
  }>;
} => {
  const results: Array<{
    source: string;
    normalized: UniversalAlert;
    validation: any;
    issues: string[];
  }> = [];

  // Test each source type
  Object.entries(testAlerts).forEach(([sourceType, testData]) => {
    const normalized = normalizeAlert(testData, sourceType);
    const validation = validateUniversalAlert(normalized);
    const issues: string[] = [];

    // Check for common normalization issues
    if (normalized.title === 'Untitled Alert') {
      issues.push('Title not properly extracted');
    }
    if (normalized.description === 'No description available') {
      issues.push('Description not properly extracted');
    }
    if (normalized.severity === 'Unknown') {
      issues.push('Severity not properly normalized');
    }
    if (normalized.urgency === 'Unknown') {
      issues.push('Urgency not properly normalized');
    }
    if (normalized.area === 'Area not specified') {
      issues.push('Area not properly extracted');
    }

    results.push({
      source: sourceType,
      normalized,
      validation,
      issues
    });
  });

  const allValid = results.every(r => r.validation.isValid && r.issues.length === 0);

  return {
    success: allValid,
    results
  };
};

// Log normalization test results
export const logNormalizationTest = () => {
  console.log('🔍 Testing Alert Normalization Consistency...');
  
  const testResults = testNormalization();
  
  if (testResults.success) {
    console.log('✅ All normalization tests passed!');
  } else {
    console.log('❌ Normalization tests failed:');
    testResults.results.forEach(result => {
      if (!result.validation.isValid || result.issues.length > 0) {
        console.log(`\n${result.source} source issues:`);
        result.validation.errors.forEach((error: string) => console.log(`  - ${error}`));
        result.issues.forEach(issue => console.log(`  - ${issue}`));
      }
    });
  }
  
  return testResults;
};
