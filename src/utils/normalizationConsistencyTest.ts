
import { UniversalAlert } from '@/types/alerts';
import { normalizeAlert, normalizeAlertBatch } from './sourceNormalizers';
import { validateUniversalAlert, validateAlertBatch } from './alertValidation';

// Comprehensive test data for all source formats
const comprehensiveTestData = {
  'alert-ready': [
    {
      id: 'test-alert-ready-1',
      title: 'Severe Weather Warning',
      summary: 'Heavy snowfall expected in Ontario region',
      severity: 'Severe',
      urgency: 'Immediate',
      category: 'Weather',
      status: 'Actual',
      area: 'Ontario',
      published: '2024-01-01T12:00:00Z',
      url: 'https://example.com/alert',
      instructions: 'Avoid travel if possible'
    }
  ],
  'bc': [
    {
      id: 'test-bc-1',
      properties: {
        title: 'Flood Warning',
        description: 'River levels rising rapidly',
        severity: 'EXTREME',
        urgency: 'IMMEDIATE',
        category: 'Flood',
        status: 'ACTUAL',
        area: 'Fraser Valley',
        published: '2024-01-01T12:00:00Z',
        instructions: 'Evacuate low-lying areas'
      }
    }
  ],
  'everbridge': [
    {
      id: 'test-everbridge-1',
      subject: 'Emergency Notification',
      message: 'Building evacuation required',
      priority: 'high',
      immediacy: 'immediate',
      type: 'Emergency',
      status: 'active',
      location: 'Vancouver Downtown',
      timestamp: '2024-01-01T12:00:00Z'
    }
  ],
  'rss': [
    {
      id: 'test-rss-1',
      title: 'Security Advisory',
      description: 'New cybersecurity threat identified',
      category: 'Security',
      pubDate: '2024-01-01T12:00:00Z',
      link: 'https://example.com/security-alert'
    }
  ]
};

// Test normalization consistency across all sources
export const runNormalizationConsistencyTest = (): {
  passed: boolean;
  results: Array<{
    source: string;
    alerts: UniversalAlert[];
    validation: any;
    issues: string[];
    performance: number;
  }>;
  summary: {
    totalSources: number;
    passingSources: number;
    totalAlerts: number;
    validAlerts: number;
    criticalIssues: string[];
  };
} => {
  console.log('🔍 Running comprehensive normalization consistency test...');
  
  const results: Array<{
    source: string;
    alerts: UniversalAlert[];
    validation: any;
    issues: string[];
    performance: number;
  }> = [];

  let totalAlerts = 0;
  let validAlerts = 0;
  const criticalIssues: string[] = [];

  // Test each source type
  Object.entries(comprehensiveTestData).forEach(([sourceType, testAlerts]) => {
    const startTime = performance.now();
    
    try {
      // Test batch normalization
      const batchResult = normalizeAlertBatch(testAlerts, sourceType);
      const validation = validateAlertBatch(batchResult.normalizedAlerts);
      
      const issues: string[] = [];
      
      // Check for normalization consistency issues
      batchResult.normalizedAlerts.forEach((normalized, index) => {
        // Required field validation
        if (normalized.title === 'Untitled Alert') {
          issues.push(`Alert ${index + 1}: Title not properly extracted`);
        }
        if (normalized.description === 'No description available') {
          issues.push(`Alert ${index + 1}: Description not properly extracted`);
        }
        if (normalized.severity === 'Unknown') {
          issues.push(`Alert ${index + 1}: Severity not properly normalized`);
        }
        if (normalized.area === 'Area not specified') {
          issues.push(`Alert ${index + 1}: Area not properly extracted`);
        }
        
        // Date validation
        if (!normalized.published || isNaN(Date.parse(normalized.published))) {
          issues.push(`Alert ${index + 1}: Invalid published date`);
        }
        
        // Source consistency
        const expectedSources = {
          'alert-ready': 'Alert Ready',
          'bc': 'BC Emergency',
          'everbridge': 'Everbridge',
          'rss': 'Other'
        };
        
        if (normalized.source !== expectedSources[sourceType as keyof typeof expectedSources]) {
          issues.push(`Alert ${index + 1}: Incorrect source mapping`);
        }
      });
      
      // Performance check
      const performanceTime = performance.now() - startTime;
      if (performanceTime > 100) { // More than 100ms per batch is concerning
        issues.push(`Slow normalization performance: ${performanceTime.toFixed(2)}ms`);
      }
      
      // Add validation errors as critical issues
      if (validation.errors.length > 0) {
        criticalIssues.push(...validation.errors.map(error => `${sourceType}: ${error}`));
      }
      
      totalAlerts += batchResult.normalizedAlerts.length;
      validAlerts += validation.validAlerts;
      
      results.push({
        source: sourceType,
        alerts: batchResult.normalizedAlerts,
        validation,
        issues,
        performance: performanceTime
      });
      
    } catch (error) {
      const errorMessage = `${sourceType}: Normalization failed - ${error.message}`;
      criticalIssues.push(errorMessage);
      
      results.push({
        source: sourceType,
        alerts: [],
        validation: { isValid: false, errors: [errorMessage], warnings: [] },
        issues: [errorMessage],
        performance: performance.now() - startTime
      });
    }
  });

  const passingSources = results.filter(r => 
    r.validation.isValid && r.issues.length === 0
  ).length;

  const testPassed = passingSources === results.length && criticalIssues.length === 0;

  return {
    passed: testPassed,
    results,
    summary: {
      totalSources: results.length,
      passingSources,
      totalAlerts,
      validAlerts,
      criticalIssues
    }
  };
};

// Log comprehensive test results
export const logNormalizationConsistencyTest = () => {
  const testResults = runNormalizationConsistencyTest();
  
  console.log('\n📊 Normalization Consistency Test Results:');
  console.log(`Overall Status: ${testResults.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Sources Tested: ${testResults.summary.totalSources}`);
  console.log(`Passing Sources: ${testResults.summary.passingSources}`);
  console.log(`Total Alerts Processed: ${testResults.summary.totalAlerts}`);
  console.log(`Valid Alerts: ${testResults.summary.validAlerts}`);
  
  if (testResults.summary.criticalIssues.length > 0) {
    console.log('\n🚨 Critical Issues:');
    testResults.summary.criticalIssues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  console.log('\n📋 Source-by-Source Results:');
  testResults.results.forEach(result => {
    const status = result.validation.isValid && result.issues.length === 0 ? '✅' : '❌';
    console.log(`  ${status} ${result.source.toUpperCase()}:`);
    console.log(`    - Alerts: ${result.alerts.length}`);
    console.log(`    - Valid: ${result.validation.validAlerts || 0}/${result.alerts.length}`);
    console.log(`    - Performance: ${result.performance.toFixed(2)}ms`);
    
    if (result.issues.length > 0) {
      console.log(`    - Issues:`);
      result.issues.forEach(issue => console.log(`      • ${issue}`));
    }
  });
  
  return testResults;
};

// Export for use in development
export const testNormalizationInDev = () => {
  if (process.env.NODE_ENV === 'development') {
    return logNormalizationConsistencyTest();
  }
  return null;
};
