import { UniversalAlert } from '@/types/alerts';

export interface AlertClassification {
  type: 'weather' | 'security' | 'immigration' | 'travel' | 'general';
  subtype: string;
  icon: string;
  urgencyScore: number;
  relevanceScore: number;
  isRoutine: boolean;
  contextualTitle: string;
}

export interface ClassifiedAlert extends UniversalAlert {
  classification: AlertClassification;
}

class AlertClassificationService {
  /**
   * Classify an alert based on source, content, and metadata
   */
  classifyAlert(alert: UniversalAlert): AlertClassification {
    const source = alert.source.toLowerCase();
    const title = alert.title.toLowerCase();
    const description = alert.description.toLowerCase();
    const content = `${title} ${description}`;

    // Source-based classification
    if (this.isWeatherSource(source)) {
      return this.classifyWeatherAlert(alert, content);
    }
    
    if (this.isSecuritySource(source)) {
      return this.classifySecurityAlert(alert, content);
    }
    
    if (this.isImmigrationSource(source)) {
      return this.classifyImmigrationAlert(alert, content);
    }

    // Content-based fallback classification
    return this.classifyByContent(alert, content);
  }

  /**
   * Enhanced alert with classification metadata
   */
  enhanceAlert(alert: UniversalAlert): ClassifiedAlert {
    return {
      ...alert,
      classification: this.classifyAlert(alert)
    };
  }

  /**
   * Batch classify multiple alerts
   */
  classifyAlerts(alerts: UniversalAlert[]): ClassifiedAlert[] {
    return alerts.map(alert => this.enhanceAlert(alert));
  }

  private isWeatherSource(source: string): boolean {
    const weatherSources = [
      'environment canada',
      'environment and climate change canada',
      'alert ready',
      'weather',
      'meteorological'
    ];
    return weatherSources.some(s => source.includes(s));
  }

  private isSecuritySource(source: string): boolean {
    const securitySources = [
      'cse',
      'csis',
      'cyber security',
      'cybersecurity',
      'security',
      'threat',
      'cisa',
      'emergency management'
    ];
    return securitySources.some(s => source.includes(s));
  }

  private isImmigrationSource(source: string): boolean {
    const immigrationSources = [
      'immigration',
      'ircc',
      'citizenship',
      'visa',
      'travel',
      'border'
    ];
    return immigrationSources.some(s => source.includes(s));
  }

  private classifyWeatherAlert(alert: UniversalAlert, content: string): AlertClassification {
    const severity = alert.severity.toLowerCase();
    const urgency = alert.urgency.toLowerCase();
    
    // Determine subtype
    let subtype = 'general weather';
    let icon = '🌤️';
    
    if (content.includes('storm') || content.includes('thunder')) {
      subtype = 'storm warning';
      icon = '⛈️';
    } else if (content.includes('snow') || content.includes('blizzard')) {
      subtype = 'winter weather';
      icon = '❄️';
    } else if (content.includes('rain') || content.includes('flood')) {
      subtype = 'precipitation alert';
      icon = '🌧️';
    } else if (content.includes('wind') || content.includes('gale')) {
      subtype = 'wind advisory';
      icon = '💨';
    } else if (content.includes('heat') || content.includes('temperature')) {
      subtype = 'temperature advisory';
      icon = '🌡️';
    }

    // Calculate scores
    const urgencyScore = this.calculateUrgencyScore(severity, urgency);
    const relevanceScore = this.calculateWeatherRelevance(alert, content);
    const isRoutine = severity === 'minor' && urgency !== 'immediate';

    return {
      type: 'weather',
      subtype,
      icon,
      urgencyScore,
      relevanceScore,
      isRoutine,
      contextualTitle: isRoutine ? 'Weather Advisory' : 'Weather Alert'
    };
  }

  private classifySecurityAlert(alert: UniversalAlert, content: string): AlertClassification {
    let subtype = 'security advisory';
    let icon = '🔒';
    
    if (content.includes('cyber') || content.includes('malware') || content.includes('phishing')) {
      subtype = 'cyber security';
      icon = '🛡️';
    } else if (content.includes('vulnerability') || content.includes('exploit')) {
      subtype = 'vulnerability alert';
      icon = '⚠️';
    } else if (content.includes('threat') || content.includes('attack')) {
      subtype = 'threat advisory';
      icon = '🚨';
    }

    const urgencyScore = this.calculateUrgencyScore(alert.severity, alert.urgency);
    const relevanceScore = 0.8; // Security alerts generally high relevance
    const isRoutine = alert.severity.toLowerCase() === 'minor';

    return {
      type: 'security',
      subtype,
      icon,
      urgencyScore,
      relevanceScore,
      isRoutine,
      contextualTitle: isRoutine ? 'Security Notice' : 'Security Alert'
    };
  }

  private classifyImmigrationAlert(alert: UniversalAlert, content: string): AlertClassification {
    let subtype = 'immigration notice';
    let icon = '🛂';
    
    if (content.includes('travel') || content.includes('visa')) {
      subtype = 'travel advisory';
      icon = '✈️';
    } else if (content.includes('policy') || content.includes('regulation')) {
      subtype = 'policy update';
      icon = '📋';
    } else if (content.includes('service') || content.includes('office')) {
      subtype = 'service advisory';
      icon = '🏢';
    }

    const urgencyScore = this.calculateUrgencyScore(alert.severity, alert.urgency);
    const relevanceScore = 0.6; // Immigration alerts moderate relevance
    const isRoutine = !content.includes('urgent') && !content.includes('immediate');

    return {
      type: 'immigration',
      subtype,
      icon,
      urgencyScore,
      relevanceScore,
      isRoutine,
      contextualTitle: isRoutine ? 'Service Notice' : 'Immigration Alert'
    };
  }

  private classifyByContent(alert: UniversalAlert, content: string): AlertClassification {
    // Fallback content-based classification
    if (content.includes('weather') || content.includes('storm') || content.includes('temperature')) {
      return this.classifyWeatherAlert(alert, content);
    }
    
    if (content.includes('security') || content.includes('cyber') || content.includes('threat')) {
      return this.classifySecurityAlert(alert, content);
    }
    
    return {
      type: 'general',
      subtype: 'general alert',
      icon: '📢',
      urgencyScore: this.calculateUrgencyScore(alert.severity, alert.urgency),
      relevanceScore: 0.5,
      isRoutine: alert.severity.toLowerCase() === 'minor',
      contextualTitle: 'Public Notice'
    };
  }

  private calculateUrgencyScore(severity: string, urgency: string): number {
    let score = 0;
    
    // Severity contribution (0-0.6)
    switch (severity.toLowerCase()) {
      case 'extreme': score += 0.6; break;
      case 'severe': score += 0.4; break;
      case 'moderate': score += 0.2; break;
      case 'minor': score += 0.1; break;
    }
    
    // Urgency contribution (0-0.4)
    switch (urgency.toLowerCase()) {
      case 'immediate': score += 0.4; break;
      case 'expected': score += 0.2; break;
      case 'future': score += 0.1; break;
    }
    
    return Math.min(1.0, score);
  }

  private calculateWeatherRelevance(alert: UniversalAlert, content: string): number {
    let relevance = 0.5; // Base relevance
    
    // Increase relevance for severe weather
    if (alert.severity === 'Extreme' || alert.severity === 'Severe') {
      relevance += 0.3;
    }
    
    // Increase for immediate urgency
    if (alert.urgency === 'Immediate') {
      relevance += 0.2;
    }
    
    // Decrease for past events
    if (alert.urgency === 'Past') {
      relevance -= 0.3;
    }
    
    return Math.min(1.0, Math.max(0.1, relevance));
  }

  /**
   * Get contextual banner title based on alert mix
   */
  getContextualBannerTitle(classifiedAlerts: ClassifiedAlert[]): string {
    if (classifiedAlerts.length === 0) return 'No Active Alerts';
    
    const types = classifiedAlerts.map(a => a.classification.type);
    const hasWeather = types.includes('weather');
    const hasSecurity = types.includes('security');
    const hasImmigration = types.includes('immigration');
    
    const criticalAlerts = classifiedAlerts.filter(a => !a.classification.isRoutine);
    
    if (criticalAlerts.length === 0) {
      return 'Routine Notices & Updates';
    }
    
    if (hasWeather && hasSecurity) {
      return 'Weather & Security Alerts';
    } else if (hasWeather && hasImmigration) {
      return 'Weather & Travel Updates';
    } else if (hasWeather) {
      return 'Weather & Public Safety Alerts';
    } else if (hasSecurity) {
      return 'Security & Safety Alerts';
    } else if (hasImmigration) {
      return 'Travel & Immigration Updates';
    }
    
    return 'Active Alerts & Notices';
  }
}

export const alertClassificationService = new AlertClassificationService();