
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Loader2,
  Rss,
  Globe,
  Clock,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EvaluationCriteria {
  connectivity: boolean;
  dataQuality: boolean;
  updateFrequency: boolean;
  contentRelevance: boolean;
  structureValid: boolean;
}

interface EvaluationResult {
  score: number;
  criteria: EvaluationCriteria;
  issues: string[];
  recommendations: string[];
  sampleData: any[];
}

const RSSFeedEvaluator = () => {
  const { toast } = useToast();
  const [feedUrl, setFeedUrl] = useState('');
  const [feedName, setFeedName] = useState('');
  const [feedDescription, setFeedDescription] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const evaluateFeed = async () => {
    if (!feedUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a feed URL',
        variant: 'destructive'
      });
      return;
    }

    setEvaluating(true);
    setResult(null);

    try {
      // Test the feed URL
      const response = await fetch(feedUrl);
      const feedText = await response.text();

      // Basic evaluation criteria
      const criteria: EvaluationCriteria = {
        connectivity: response.ok,
        dataQuality: feedText.includes('<item>') || feedText.includes('<entry>'),
        updateFrequency: true, // Would need historical data to properly evaluate
        contentRelevance: feedText.toLowerCase().includes('alert') || 
                         feedText.toLowerCase().includes('warning') ||
                         feedText.toLowerCase().includes('emergency'),
        structureValid: feedText.includes('<?xml') && 
                       (feedText.includes('<rss') || feedText.includes('<feed'))
      };

      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 0;

      // Evaluate each criterion
      if (criteria.connectivity) {
        score += 25;
      } else {
        issues.push('Unable to connect to the feed URL');
        recommendations.push('Verify the URL is correct and accessible');
      }

      if (criteria.structureValid) {
        score += 25;
      } else {
        issues.push('Feed does not appear to be valid XML/RSS format');
        recommendations.push('Ensure the feed follows RSS or Atom standards');
      }

      if (criteria.dataQuality) {
        score += 25;
      } else {
        issues.push('Feed does not contain expected item/entry elements');
        recommendations.push('Verify the feed contains actual content items');
      }

      if (criteria.contentRelevance) {
        score += 25;
      } else {
        issues.push('Feed content may not be relevant for emergency alerts');
        recommendations.push('Consider if this feed provides security/emergency information');
      }

      // Extract sample data (simplified)
      const sampleData = [];
      if (criteria.dataQuality) {
        const itemMatches = feedText.match(/<item>[\s\S]*?<\/item>/g);
        if (itemMatches) {
          sampleData.push(...itemMatches.slice(0, 3).map((item, index) => ({
            id: index + 1,
            raw: item.substring(0, 200) + '...'
          })));
        }
      }

      setResult({
        score,
        criteria,
        issues,
        recommendations,
        sampleData
      });

      toast({
        title: 'Evaluation Complete',
        description: `Feed evaluation completed with score: ${score}/100`,
        variant: score >= 75 ? 'default' : 'destructive'
      });

    } catch (error) {
      console.error('Feed evaluation error:', error);
      
      const criteria: EvaluationCriteria = {
        connectivity: false,
        dataQuality: false,
        updateFrequency: false,
        contentRelevance: false,
        structureValid: false
      };

      setResult({
        score: 0,
        criteria,
        issues: ['Failed to fetch or parse the feed', error.message],
        recommendations: ['Check the URL and try again', 'Verify the feed is publicly accessible'],
        sampleData: []
      });

      toast({
        title: 'Evaluation Failed',
        description: 'Unable to evaluate the RSS feed',
        variant: 'destructive'
      });
    } finally {
      setEvaluating(false);
    }
  };

  const addFeedToSystem = async () => {
    if (!result || result.score < 50) {
      toast({
        title: 'Cannot Add Feed',
        description: 'Feed evaluation score is too low to add to the system',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('alert_sources')
        .insert([{
          name: feedName || 'New RSS Feed',
          description: feedDescription || 'RSS feed added via evaluation',
          source_type: 'rss',
          api_endpoint: feedUrl,
          is_active: result.score >= 75, // Only activate high-scoring feeds
          polling_interval: 300,
          configuration: {
            evaluation_score: result.score,
            evaluation_date: new Date().toISOString(),
            evaluation_criteria: result.criteria
          }
        }]);

      if (error) throw error;

      toast({
        title: 'Feed Added',
        description: 'RSS feed has been added to the system',
      });

      // Reset form
      setFeedUrl('');
      setFeedName('');
      setFeedDescription('');
      setResult(null);

    } catch (error) {
      console.error('Error adding feed:', error);
      toast({
        title: 'Error',
        description: 'Failed to add feed to the system',
        variant: 'destructive'
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 75) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Rss className="mr-2 h-5 w-5" />
          RSS Feed Evaluator
        </CardTitle>
        <CardDescription>
          Evaluate new RSS feeds for quality and relevance before adding them to the system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedUrl">RSS Feed URL *</Label>
              <Input
                id="feedUrl"
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
                placeholder="https://example.com/rss"
                type="url"
              />
            </div>
            <div>
              <Label htmlFor="feedName">Feed Name</Label>
              <Input
                id="feedName"
                value={feedName}
                onChange={(e) => setFeedName(e.target.value)}
                placeholder="Emergency Alert Feed"
              />
            </div>
            <div>
              <Label htmlFor="feedDescription">Description</Label>
              <Textarea
                id="feedDescription"
                value={feedDescription}
                onChange={(e) => setFeedDescription(e.target.value)}
                placeholder="Brief description of this RSS feed"
                rows={3}
              />
            </div>
            <Button 
              onClick={evaluateFeed} 
              disabled={evaluating || !feedUrl.trim()}
              className="w-full"
            >
              {evaluating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Evaluate Feed
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            {result && (
              <>
                <div className="text-center p-4 border rounded-lg">
                  <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}/100
                  </div>
                  <div className="mt-2">
                    {getScoreBadge(result.score)}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Evaluation Criteria</h4>
                  <div className="space-y-1">
                    {Object.entries(result.criteria).map(([key, passed]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        {passed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {result.issues.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Issues Found:</strong>
                      <ul className="mt-1 list-disc list-inside text-sm">
                        {result.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {result.score >= 50 && (
                  <Button 
                    onClick={addFeedToSystem}
                    className="w-full"
                    variant={result.score >= 75 ? 'default' : 'secondary'}
                  >
                    <Database className="mr-2 h-4 w-4" />
                    Add to System
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {result && result.recommendations.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Recommendations:</strong>
              <ul className="mt-1 list-disc list-inside text-sm">
                {result.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default RSSFeedEvaluator;
