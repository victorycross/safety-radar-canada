import { UniversalAlert } from '@/types/alerts';

export interface ConfidenceConfig {
  minDisplayThreshold: number;
  highConfidenceThreshold: number;
  mediumConfidenceThreshold: number;
  lowConfidenceThreshold: number;
  autoHideBelow: number;
}

export const DEFAULT_CONFIDENCE_CONFIG: ConfidenceConfig = {
  minDisplayThreshold: 0.3,     // Don't show alerts below 30% confidence
  highConfidenceThreshold: 0.8, // High confidence: 80%+
  mediumConfidenceThreshold: 0.6, // Medium confidence: 60-79%
  lowConfidenceThreshold: 0.4,  // Low confidence: 40-59%
  autoHideBelow: 0.3            // Auto-hide below 30%
};

export interface AlertWithConfidence extends UniversalAlert {
  confidenceLevel: 'high' | 'medium' | 'low' | 'very-low';
  isFromAuthoritativeSource: boolean;
  dataQualityScore: number;
}

export class ConfidenceFilteringService {
  private config: ConfidenceConfig;

  constructor(config: ConfidenceConfig = DEFAULT_CONFIDENCE_CONFIG) {
    this.config = config;
  }

  /**
   * Enhance alerts with confidence metadata
   */
  enhanceAlertsWithConfidence(alerts: UniversalAlert[]): AlertWithConfidence[] {
    return alerts.map(alert => this.enhanceAlert(alert));
  }

  /**
   * Filter alerts based on confidence thresholds
   */
  filterByConfidence(alerts: UniversalAlert[], includeVeryLow: boolean = false): AlertWithConfidence[] {
    const enhanced = this.enhanceAlertsWithConfidence(alerts);
    
    return enhanced.filter(alert => {
      if (!includeVeryLow && alert.confidenceLevel === 'very-low') {
        return false;
      }
      
      // Always show authoritative sources regardless of confidence
      if (alert.isFromAuthoritativeSource && alert.confidenceLevel !== 'very-low') {
        return true;
      }
      
      return alert.dataQualityScore >= this.config.minDisplayThreshold;
    });
  }

  /**
   * Get confidence-based display configuration
   */
  getDisplayConfig(alert: AlertWithConfidence) {
    return {
      showConfidenceBadge: !alert.isFromAuthoritativeSource || alert.confidenceLevel === 'low',
      requiresVerification: alert.confidenceLevel === 'low' && !alert.isFromAuthoritativeSource,
      autoArchiveEligible: alert.confidenceLevel === 'very-low' && !alert.isFromAuthoritativeSource,
      visualPriority: this.getVisualPriority(alert),
      warningLevel: this.getWarningLevel(alert)
    };
  }

  private enhanceAlert(alert: UniversalAlert): AlertWithConfidence {
    const isFromAuthoritativeSource = this.isAuthoritativeSource(alert.source);
    const baseConfidence = this.calculateBaseConfidence(alert);
    const sourceBonus = isFromAuthoritativeSource ? 0.2 : 0;
    const dataQualityScore = Math.min(1.0, baseConfidence + sourceBonus);
    
    return {
      ...alert,
      confidenceLevel: this.getConfidenceLevel(dataQualityScore),
      isFromAuthoritativeSource,
      dataQualityScore
    };
  }

  private isAuthoritativeSource(source: string): boolean {
    const authoritativeSources = [
      'Alert Ready',
      'Environment Canada', 
      'Environment and Climate Change Canada',
      'BC Emergency',
      'Government of Canada',
      'Immigration, Refugees and Citizenship Canada',
      'Public Safety Canada'
    ];
    
    return authoritativeSources.some(authSource => 
      source.toLowerCase().includes(authSource.toLowerCase())
    );
  }

  private calculateBaseConfidence(alert: UniversalAlert): number {
    let confidence = 0.5; // Start with medium confidence
    
    // Boost confidence for complete data
    if (alert.title && alert.description) confidence += 0.1;
    if (alert.published) confidence += 0.1;
    if (alert.area && alert.area !== 'Unknown') confidence += 0.1;
    
    // Boost for severity indication
    if (alert.severity && alert.severity !== 'Unknown') confidence += 0.1;
    if (alert.urgency && alert.urgency !== 'Unknown') confidence += 0.1;
    
    // Penalty for incomplete or poor quality data
    if (!alert.description || alert.description.length < 10) confidence -= 0.2;
    if (!alert.area || alert.area === 'Unknown') confidence -= 0.1;
    if (alert.severity === 'Unknown') confidence -= 0.1;
    
    return Math.max(0, Math.min(1, confidence));
  }

  private getConfidenceLevel(score: number): 'high' | 'medium' | 'low' | 'very-low' {
    if (score >= this.config.highConfidenceThreshold) return 'high';
    if (score >= this.config.mediumConfidenceThreshold) return 'medium';
    if (score >= this.config.lowConfidenceThreshold) return 'low';
    return 'very-low';
  }

  private getVisualPriority(alert: AlertWithConfidence): number {
    // Higher numbers = higher visual priority
    let priority = 0;
    
    // Authoritative sources get priority
    if (alert.isFromAuthoritativeSource) priority += 3;
    
    // Confidence level impact
    switch (alert.confidenceLevel) {
      case 'high': priority += 4; break;
      case 'medium': priority += 2; break;
      case 'low': priority += 1; break;
      case 'very-low': priority -= 1; break;
    }
    
    // Severity impact
    switch (alert.severity?.toLowerCase()) {
      case 'extreme': priority += 4; break;
      case 'severe': priority += 3; break;
      case 'moderate': priority += 1; break;
    }
    
    return Math.max(0, priority);
  }

  private getWarningLevel(alert: AlertWithConfidence): 'none' | 'info' | 'warning' | 'critical' {
    if (alert.isFromAuthoritativeSource && alert.confidenceLevel === 'high') {
      return 'none';
    }
    
    if (alert.confidenceLevel === 'very-low') {
      return 'critical';
    }
    
    if (alert.confidenceLevel === 'low' && !alert.isFromAuthoritativeSource) {
      return 'warning';
    }
    
    if (!alert.isFromAuthoritativeSource) {
      return 'info';
    }
    
    return 'none';
  }
}

export const confidenceFilteringService = new ConfidenceFilteringService();