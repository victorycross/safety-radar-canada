import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestTube, Play, CheckCircle, XCircle, AlertTriangle, BarChart3 } from 'lucide-react';
import { ClassificationRule } from '@/hooks/useDataProcessingConfig';

interface ClassificationTesterProps {
  rules: ClassificationRule[];
}

interface TestResult {
  rule: ClassificationRule;
  matched: boolean;
  matchDetails?: RegExpMatchArray | null;
}

const ClassificationTester: React.FC<ClassificationTesterProps> = ({ rules }) => {
  const [testText, setTestText] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = () => {
    if (!testText.trim()) return;
    
    setIsRunning(true);
    
    // Simulate processing delay for better UX
    setTimeout(() => {
      const results: TestResult[] = [];
      
      // Test each active rule against the input text
      rules
        .filter(rule => rule.is_active)
        .sort((a, b) => b.priority - a.priority) // Test higher priority first
        .forEach(rule => {
          try {
            const regex = new RegExp(rule.condition_pattern, 'gi');
            const matches = testText.match(regex);
            const matched = matches !== null;
            
            results.push({
              rule,
              matched,
              matchDetails: matches
            });
          } catch (error) {
            console.error(`Error testing rule ${rule.id}:`, error);
            results.push({
              rule,
              matched: false,
              matchDetails: null
            });
          }
        });
      
      setTestResults(results);
      setIsRunning(false);
    }, 500);
  };

  const getMatchedRules = () => testResults.filter(result => result.matched);
  const getUnmatchedRules = () => testResults.filter(result => !result.matched);

  const getSampleTexts = () => [
    "EXTREME weather warning: Severe thunderstorm approaching with high winds and hail",
    "Minor update: Scheduled maintenance window for immigration services",
    "CRITICAL security alert: Cyber attack detected on government systems",
    "Moderate travel advisory for international destinations due to civil unrest",
    "Severe flooding reported in multiple provinces - immediate action required"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Classification Pattern Tester
          </CardTitle>
          <CardDescription>
            Test your classification rules against sample text to verify pattern matching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Test Text</label>
            <Textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter alert text to test against classification rules..."
              rows={4}
              className="font-mono"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <Button 
              onClick={runTest} 
              disabled={!testText.trim() || isRunning}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunning ? 'Testing...' : 'Run Test'}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Testing against {rules.filter(r => r.is_active).length} active rules
            </div>
          </div>

          {/* Sample Text Buttons */}
          <div>
            <label className="text-sm font-medium mb-2 block">Quick Test Samples</label>
            <div className="flex flex-wrap gap-2">
              {getSampleTexts().map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setTestText(sample)}
                  className="text-xs"
                >
                  Sample {index + 1}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <>
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Test Results Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {getMatchedRules().length}
                  </div>
                  <div className="text-sm text-muted-foreground">Rules Matched</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {getUnmatchedRules().length}
                  </div>
                  <div className="text-sm text-muted-foreground">Rules Not Matched</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {testResults.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Rules Tested</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matched Rules */}
          {getMatchedRules().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Matched Rules ({getMatchedRules().length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getMatchedRules().map((result, index) => (
                    <div key={result.rule.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-green-600 text-green-600">
                            {result.rule.rule_type.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{result.rule.classification_value}</span>
                          <Badge variant="secondary">
                            Priority: {result.rule.priority}
                          </Badge>
                        </div>
                        <Badge variant="default">
                          Confidence: {result.rule.confidence_score}
                        </Badge>
                      </div>
                      <div className="text-sm font-mono bg-white p-2 rounded border">
                        Pattern: {result.rule.condition_pattern}
                      </div>
                      {result.matchDetails && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Matches: </span>
                          {result.matchDetails.map((match, i) => (
                            <Badge key={i} variant="outline" className="mr-1">
                              "{match}"
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unmatched Rules */}
          {getUnmatchedRules().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-600">
                  <XCircle className="h-5 w-5" />
                  Unmatched Rules ({getUnmatchedRules().length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getUnmatchedRules().slice(0, 5).map((result) => (
                    <div key={result.rule.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {result.rule.rule_type.toUpperCase()}
                          </Badge>
                          <span className="text-sm">{result.rule.classification_value}</span>
                        </div>
                      </div>
                      <div className="text-xs font-mono text-gray-600 mt-1">
                        {result.rule.condition_pattern}
                      </div>
                    </div>
                  ))}
                  {getUnmatchedRules().length > 5 && (
                    <div className="text-sm text-muted-foreground text-center">
                      ... and {getUnmatchedRules().length - 5} more rules
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {getMatchedRules().length === 0 && testText.trim() && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No classification rules matched this text. Consider creating new rules or adjusting existing patterns 
                to handle this type of content.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
};

export default ClassificationTester;