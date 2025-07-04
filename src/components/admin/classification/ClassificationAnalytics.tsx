import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Target, AlertCircle, RefreshCw } from 'lucide-react';
import { ClassificationRule } from '@/hooks/useDataProcessingConfig';
import { supabase } from '@/integrations/supabase/client';

interface ClassificationAnalyticsProps {
  rules: ClassificationRule[];
}

interface PerformanceMetric {
  rule_id: string;
  rule_type: string;
  classification_value: string;
  total_processed: number;
  successful_matches: number;
  confidence_average: number;
  last_used: string | null;
  accuracy_rate: number;
}

const ClassificationAnalytics: React.FC<ClassificationAnalyticsProps> = ({ rules }) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate loading analytics data
      // In a real implementation, this would query alert processing logs
      const mockMetrics: PerformanceMetric[] = rules.map(rule => ({
        rule_id: rule.id,
        rule_type: rule.rule_type,
        classification_value: rule.classification_value,
        total_processed: Math.floor(Math.random() * 1000) + 100,
        successful_matches: Math.floor(Math.random() * 500) + 50,
        confidence_average: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)),
        last_used: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        accuracy_rate: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2))
      }));

      setMetrics(mockMetrics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [rules]);

  const getTopPerformers = () => {
    return metrics
      .sort((a, b) => b.accuracy_rate - a.accuracy_rate)
      .slice(0, 5);
  };

  const getUnderperformers = () => {
    return metrics
      .filter(metric => metric.accuracy_rate < 0.7)
      .sort((a, b) => a.accuracy_rate - b.accuracy_rate);
  };

  const getUnusedRules = () => {
    return metrics.filter(metric => !metric.last_used || 
      new Date(metric.last_used) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  };

  const getTotalStats = () => {
    const totalProcessed = metrics.reduce((sum, m) => sum + m.total_processed, 0);
    const totalMatches = metrics.reduce((sum, m) => sum + m.successful_matches, 0);
    const avgConfidence = metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.confidence_average, 0) / metrics.length 
      : 0;
    const avgAccuracy = metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.accuracy_rate, 0) / metrics.length 
      : 0;

    return {
      totalProcessed,
      totalMatches,
      avgConfidence: parseFloat(avgConfidence.toFixed(2)),
      avgAccuracy: parseFloat(avgAccuracy.toFixed(2)),
      matchRate: totalProcessed > 0 ? parseFloat((totalMatches / totalProcessed).toFixed(2)) : 0
    };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Classification Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Performance metrics and insights for classification rules
          </p>
        </div>
        <Button onClick={loadAnalytics} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Processed</p>
                <p className="text-2xl font-bold">{stats.totalProcessed.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Match Rate</p>
                <p className="text-2xl font-bold">{(stats.matchRate * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">{(stats.avgConfidence * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Accuracy</p>
                <p className="text-2xl font-bold">{(stats.avgAccuracy * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <TrendingUp className="h-5 w-5" />
            Top Performing Rules
          </CardTitle>
          <CardDescription>
            Rules with the highest accuracy rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getTopPerformers().map((metric, index) => (
              <div key={metric.rule_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <div className="font-medium">{metric.classification_value}</div>
                    <div className="text-sm text-muted-foreground">
                      {metric.rule_type} • {metric.successful_matches}/{metric.total_processed} matches
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    {(metric.accuracy_rate * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Confidence: {(metric.confidence_average * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Underperformers */}
      {getUnderperformers().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-5 w-5" />
              Rules Needing Attention
            </CardTitle>
            <CardDescription>
              Rules with accuracy below 70% - consider reviewing patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getUnderperformers().map((metric) => (
                <div key={metric.rule_id} className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                  <div>
                    <div className="font-medium">{metric.classification_value}</div>
                    <div className="text-sm text-muted-foreground">
                      {metric.rule_type} • {metric.successful_matches}/{metric.total_processed} matches
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">
                      {(metric.accuracy_rate * 100).toFixed(1)}%
                    </div>
                    <Button variant="outline" size="sm" className="mt-1">
                      Review Pattern
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unused Rules */}
      {getUnusedRules().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-600">
              <AlertCircle className="h-5 w-5" />
              Unused Rules
            </CardTitle>
            <CardDescription>
              Rules that haven't been triggered in the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getUnusedRules().map((metric) => (
                <div key={metric.rule_id} className="flex items-center justify-between p-2 border rounded bg-gray-50">
                  <div>
                    <span className="font-medium">{metric.classification_value}</span>
                    <span className="text-sm text-muted-foreground ml-2">({metric.rule_type})</span>
                  </div>
                  <Badge variant="outline">Unused</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {lastUpdated && (
        <div className="text-sm text-muted-foreground text-center">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default ClassificationAnalytics;