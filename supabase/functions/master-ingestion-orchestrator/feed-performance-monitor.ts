import { AlertSource, ProcessingResult } from './types.ts';

export interface FeedQualityMetrics {
  source_id: string;
  feed_name: string;
  normalization_success_rate: number;
  avg_title_length: number;
  avg_description_length: number;
  severity_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
  data_quality_score: number;
  issues: string[];
  recommendations: string[];
}

export class FeedPerformanceMonitor {
  private qualityThresholds = {
    min_title_length: 10,
    min_description_length: 20,
    max_title_length: 200,
    max_description_length: 2000,
    min_success_rate: 0.8,
    min_quality_score: 0.7
  };

  async evaluateFeedQuality(
    source: AlertSource, 
    processedAlerts: any[], 
    rawAlerts: any[]
  ): Promise<FeedQualityMetrics> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Calculate normalization success rate
    const successRate = rawAlerts.length > 0 ? processedAlerts.length / rawAlerts.length : 0;
    
    // Analyze processed alerts quality
    const titleLengths = processedAlerts.map(alert => alert.title?.length || 0);
    const descLengths = processedAlerts.map(alert => alert.description?.length || 0);
    
    const avgTitleLength = titleLengths.reduce((a, b) => a + b, 0) / titleLengths.length || 0;
    const avgDescLength = descLengths.reduce((a, b) => a + b, 0) / descLengths.length || 0;
    
    // Severity distribution
    const severityDist = this.calculateDistribution(processedAlerts, 'severity');
    const categoryDist = this.calculateDistribution(processedAlerts, 'category');
    
    // Quality checks
    if (successRate < this.qualityThresholds.min_success_rate) {
      issues.push(`Low normalization success rate: ${Math.round(successRate * 100)}%`);
      recommendations.push('Review field mapping configuration');
    }
    
    if (avgTitleLength < this.qualityThresholds.min_title_length) {
      issues.push(`Average title length too short: ${Math.round(avgTitleLength)} chars`);
      recommendations.push('Check title field mapping');
    }
    
    if (avgDescLength < this.qualityThresholds.min_description_length) {
      issues.push(`Average description length too short: ${Math.round(avgDescLength)} chars`);
      recommendations.push('Verify description field extraction');
    }
    
    // Check for unknown severity/category concentration
    const unknownSeverity = severityDist['Unknown'] || 0;
    const unknownCategory = categoryDist['General'] || 0;
    
    if (unknownSeverity > 0.5) {
      issues.push(`High proportion of unknown severity: ${Math.round(unknownSeverity * 100)}%`);
      recommendations.push('Improve severity detection rules');
    }
    
    if (unknownCategory > 0.7) {
      issues.push(`High proportion of general category: ${Math.round(unknownCategory * 100)}%`);
      recommendations.push('Add category classification rules');
    }
    
    // Calculate overall data quality score
    const qualityScore = this.calculateQualityScore(
      successRate, avgTitleLength, avgDescLength, unknownSeverity, unknownCategory
    );
    
    return {
      source_id: source.id,
      feed_name: source.name,
      normalization_success_rate: successRate,
      avg_title_length: avgTitleLength,
      avg_description_length: avgDescLength,
      severity_distribution: severityDist,
      category_distribution: categoryDist,
      data_quality_score: qualityScore,
      issues,
      recommendations
    };
  }

  private calculateDistribution(alerts: any[], field: string): Record<string, number> {
    const counts: Record<string, number> = {};
    const total = alerts.length;
    
    alerts.forEach(alert => {
      const value = alert[field] || 'Unknown';
      counts[value] = (counts[value] || 0) + 1;
    });
    
    // Convert to proportions
    Object.keys(counts).forEach(key => {
      counts[key] = counts[key] / total;
    });
    
    return counts;
  }

  private calculateQualityScore(
    successRate: number,
    avgTitleLength: number,
    avgDescLength: number,
    unknownSeverity: number,
    unknownCategory: number
  ): number {
    const weights = {
      success_rate: 0.3,
      title_quality: 0.2,
      desc_quality: 0.2,
      severity_clarity: 0.15,
      category_clarity: 0.15
    };
    
    const titleScore = Math.min(avgTitleLength / this.qualityThresholds.min_title_length, 1);
    const descScore = Math.min(avgDescLength / this.qualityThresholds.min_description_length, 1);
    const severityScore = 1 - unknownSeverity;
    const categoryScore = 1 - unknownCategory;
    
    return (
      successRate * weights.success_rate +
      titleScore * weights.title_quality +
      descScore * weights.desc_quality +
      severityScore * weights.severity_clarity +
      categoryScore * weights.category_clarity
    );
  }

  async logQualityMetrics(supabaseClient: any, metrics: FeedQualityMetrics): Promise<void> {
    try {
      // Store quality metrics in database for monitoring
      const { error } = await supabaseClient
        .from('feed_quality_metrics')
        .insert({
          source_id: metrics.source_id,
          evaluation_timestamp: new Date().toISOString(),
          normalization_success_rate: metrics.normalization_success_rate,
          avg_title_length: metrics.avg_title_length,
          avg_description_length: metrics.avg_description_length,
          severity_distribution: metrics.severity_distribution,
          category_distribution: metrics.category_distribution,
          data_quality_score: metrics.data_quality_score,
          issues: metrics.issues,
          recommendations: metrics.recommendations
        });
      
      if (error) {
        console.error('Failed to log quality metrics:', error);
      }
      
      // Log performance insights
      console.log(`📊 [Feed Quality] ${metrics.feed_name}:`);
      console.log(`  Success Rate: ${Math.round(metrics.normalization_success_rate * 100)}%`);
      console.log(`  Quality Score: ${Math.round(metrics.data_quality_score * 100)}%`);
      
      if (metrics.issues.length > 0) {
        console.log(`  Issues: ${metrics.issues.join(', ')}`);
      }
      
      if (metrics.recommendations.length > 0) {
        console.log(`  Recommendations: ${metrics.recommendations.join(', ')}`);
      }
      
    } catch (error) {
      console.error('Error logging quality metrics:', error);
    }
  }
}

export const feedMonitor = new FeedPerformanceMonitor();