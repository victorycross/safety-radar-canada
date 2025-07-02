import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  Zap, 
  Target, 
  TrendingUp, 
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Brain,
  Activity,
  MapPin,
  Timer,
  Award,
  Database,
  Filter,
  Plus,
  Edit
} from 'lucide-react';
import { useDataProcessingConfig } from '@/hooks/useDataProcessingConfig';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalysisRule {
  id: string;
  analysis_type: string;
  rule_config: any;
  threshold_values: any;
  is_active: boolean;
  rule_template?: string;
  performance_metrics?: any;
  last_executed_at?: string;
  execution_count?: number;
  average_processing_time_ms?: number;
  created_at: string;
}

const ProcessingManagementTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('analysis');
  const [analysisRules, setAnalysisRules] = useState<AnalysisRule[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const { toast } = useToast();
  
  const { 
    normalizationRules, 
    classificationRules, 
    loading: configLoading, 
    error, 
    updateRuleStatus, 
  } = useDataProcessingConfig();

  useEffect(() => {
    fetchAnalysisRules();
  }, []);

  const fetchAnalysisRules = async () => {
    try {
      setLoadingAnalysis(true);
      const { data, error } = await supabase
        .from('analysis_rules')
        .select('*')
        .order('analysis_type');
      
      if (error) throw error;
      setAnalysisRules(data || []);
    } catch (err) {
      console.error('Error fetching analysis rules:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch analysis rules',
        variant: 'destructive'
      });
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const toggleAnalysisRule = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('analysis_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);
      
      if (error) throw error;
      
      setAnalysisRules(prev => 
        prev.map(rule => 
          rule.id === ruleId ? { ...rule, is_active: isActive } : rule
        )
      );
      
      toast({
        title: 'Rule Updated',
        description: `Analysis rule ${isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (err) {
      console.error('Error updating analysis rule:', err);
      toast({
        title: 'Error',
        description: 'Failed to update analysis rule',
        variant: 'destructive'
      });
    }
  };

  const getAnalysisRuleIcon = (type: string) => {
    switch (type) {
      case 'risk_assessment': return Brain;
      case 'correlation': return Activity;
      case 'trend_detection': return TrendingUp;
      case 'automated_scoring': return Award;
      case 'alert_escalation': return AlertTriangle;
      case 'quality_assurance': return CheckCircle;
      case 'geographic_analysis': return MapPin;
      case 'temporal_analysis': return Timer;
      default: return Zap;
    }
  };

  const getAnalysisRuleColor = (type: string, isActive: boolean) => {
    if (!isActive) return 'text-muted-foreground';
    
    switch (type) {
      case 'risk_assessment': return 'text-red-500';
      case 'correlation': return 'text-blue-500';
      case 'trend_detection': return 'text-green-500';
      case 'automated_scoring': return 'text-purple-500';
      case 'alert_escalation': return 'text-orange-500';
      case 'quality_assurance': return 'text-emerald-500';
      case 'geographic_analysis': return 'text-cyan-500';
      case 'temporal_analysis': return 'text-indigo-500';
      default: return 'text-gray-500';
    }
  };

  const getPerformanceScore = (rule: AnalysisRule) => {
    if (!rule.performance_metrics || !rule.execution_count) return 0;
    
    const avgTime = rule.average_processing_time_ms || 0;
    const executionCount = rule.execution_count || 0;
    
    // Calculate performance score based on execution count and processing time
    let score = Math.min(executionCount / 100, 1) * 50; // Execution frequency (max 50%)
    score += Math.max(0, (5000 - avgTime) / 5000) * 50; // Processing speed (max 50%)
    
    return Math.round(score);
  };

  if (configLoading || loadingAnalysis) {
    return <div className="p-6">Loading processing configuration...</div>;
  }

  if (error) {
    return <div className="p-6 text-destructive">Error loading configuration: {error}</div>;
  }

  const activeAnalysisRules = analysisRules.filter(rule => rule.is_active);
  const activeNormalizationRules = normalizationRules.filter(rule => rule.is_active);
  const activeSeverityRules = classificationRules.filter(rule => rule.rule_type === 'severity' && rule.is_active);
  const activeCategoryRules = classificationRules.filter(rule => rule.rule_type === 'category' && rule.is_active);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Processing Management</h3>
        <p className="text-muted-foreground">
          Advanced configuration for analysis rules, normalization, and classification
        </p>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Analysis Engine
          </TabsTrigger>
          <TabsTrigger value="normalization" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Normalization
          </TabsTrigger>
          <TabsTrigger value="classification" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Classification
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Quality Control
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          {/* Analysis Rules Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Analysis Engine Configuration
              </CardTitle>
              <CardDescription>
                Comprehensive analysis rules for risk assessment, correlation, and automated scoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <Brain className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="font-medium">Risk Assessment</div>
                  <Badge variant="default" className="mt-2">
                    {analysisRules.filter(r => r.analysis_type === 'risk_assessment' && r.is_active).length} Active
                  </Badge>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Activity className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="font-medium">Correlation Analysis</div>
                  <Badge variant="default" className="mt-2">
                    {analysisRules.filter(r => r.analysis_type === 'correlation' && r.is_active).length} Active
                  </Badge>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="font-medium">Automated Scoring</div>
                  <Badge variant="default" className="mt-2">
                    {analysisRules.filter(r => r.analysis_type === 'automated_scoring' && r.is_active).length} Active
                  </Badge>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="font-medium">Alert Escalation</div>
                  <Badge variant="default" className="mt-2">
                    {analysisRules.filter(r => r.analysis_type === 'alert_escalation' && r.is_active).length} Active
                  </Badge>
                </div>
              </div>

              {/* Detailed Analysis Rules */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium">Analysis Rules Configuration</h4>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Analysis Rule
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  {analysisRules.map((rule) => {
                    const IconComponent = getAnalysisRuleIcon(rule.analysis_type);
                    const iconColor = getAnalysisRuleColor(rule.analysis_type, rule.is_active);
                    const performanceScore = getPerformanceScore(rule);
                    
                    return (
                      <Card key={rule.id} className={`transition-all duration-200 ${rule.is_active ? 'border-primary/20 bg-primary/5' : 'border-muted'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <IconComponent className={`h-8 w-8 ${iconColor}`} />
                              <div>
                                <h4 className="font-medium capitalize">
                                  {rule.analysis_type.replace('_', ' ')}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Template: {rule.rule_template || 'Custom'}
                                  {rule.execution_count && ` • Executed ${rule.execution_count} times`}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              {/* Performance Metrics */}
                              {rule.execution_count && (
                                <div className="text-center">
                                  <div className="text-sm font-medium">Performance</div>
                                  <Progress value={performanceScore} className="w-16 h-2" />
                                  <div className="text-xs text-muted-foreground">{performanceScore}%</div>
                                </div>
                              )}
                              
                              {/* Processing Time */}
                              {rule.average_processing_time_ms && (
                                <div className="text-center">
                                  <div className="text-sm font-medium">Avg Time</div>
                                  <div className="text-lg font-bold">
                                    {rule.average_processing_time_ms}ms
                                  </div>
                                </div>
                              )}
                              
                              {/* Controls */}
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={rule.is_active}
                                  onCheckedChange={(checked) => toggleAnalysisRule(rule.id, checked)}
                                />
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>
                                        {rule.analysis_type.replace('_', ' ').toUpperCase()} Configuration
                                      </DialogTitle>
                                      <DialogDescription>
                                        Advanced configuration for {rule.analysis_type} analysis rule
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="font-medium">Rule Configuration</label>
                                          <pre className="mt-1 text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                                            {JSON.stringify(rule.rule_config, null, 2)}
                                          </pre>
                                        </div>
                                        <div>
                                          <label className="font-medium">Threshold Values</label>
                                          <pre className="mt-1 text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                                            {JSON.stringify(rule.threshold_values, null, 2)}
                                          </pre>
                                        </div>
                                      </div>
                                      
                                      {rule.performance_metrics && Object.keys(rule.performance_metrics).length > 0 && (
                                        <div>
                                          <label className="font-medium">Performance Metrics</label>
                                          <pre className="mt-1 text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                                            {JSON.stringify(rule.performance_metrics, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="normalization" className="space-y-6">
          {/* Data Normalization Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Normalization Settings
              </CardTitle>
              <CardDescription>
                Field mapping, format conversion, and data standardization rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Field Mapping Rules</span>
                    <Badge variant="default">{activeNormalizationRules.length} Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Date Format Conversion</span>
                    <Badge variant="default">
                      {activeNormalizationRules.some(rule => 
                        rule.transformation_rules?.date_formats || 
                        rule.field_mappings?.published
                      ) ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Location Standardization</span>
                    <Badge variant="default">
                      {activeNormalizationRules.some(rule => 
                        rule.transformation_rules?.location_mapping ||
                        rule.field_mappings?.area
                      ) ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Text Cleaning Rules</span>
                    <Badge variant="default">
                      {activeNormalizationRules.reduce((count, rule) => 
                        count + (rule.transformation_rules?.text_cleaning?.length || 0), 0
                      )} Rules
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure Mapping
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Normalization Rules Configuration</DialogTitle>
                        <DialogDescription>
                          Manage field mapping and transformation rules for different source types
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {normalizationRules.map((rule) => (
                          <div key={rule.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-medium">{rule.source_type.toUpperCase()} Source</h4>
                                <p className="text-sm text-muted-foreground">
                                  Priority: {rule.priority} | Created: {new Date(rule.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={rule.is_active}
                                  onCheckedChange={(checked) => updateRuleStatus('normalization', rule.id, checked)}
                                />
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Field Mappings:</span>
                                <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                                  {JSON.stringify(rule.field_mappings, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <span className="font-medium">Transformations:</span>
                                <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                                  {JSON.stringify(rule.transformation_rules || {}, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Rule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classification" className="space-y-6">
          {/* Classification Rules Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Classification Rules
              </CardTitle>
              <CardDescription>
                Severity levels, categories, and personnel impact classification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <div className="font-medium">Critical Alerts</div>
                    <div className="text-sm text-muted-foreground">Extreme/Severe severity classification</div>
                    <Badge variant="destructive" className="mt-2">
                      {activeSeverityRules.filter(rule => 
                        rule.classification_value === 'Extreme' || rule.classification_value === 'Severe'
                      ).length} Rules
                    </Badge>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <Shield className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <div className="font-medium">Security Matters</div>
                    <div className="text-sm text-muted-foreground">Cybersecurity and safety classification</div>
                    <Badge variant="secondary" className="mt-2">
                      {activeCategoryRules.filter(rule => 
                        rule.classification_value.toLowerCase().includes('security') ||
                        rule.classification_value.toLowerCase().includes('cyber')
                      ).length} Rules
                    </Badge>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="font-medium">Routine Updates</div>
                    <div className="text-sm text-muted-foreground">Minor/Info severity classification</div>
                    <Badge variant="outline" className="mt-2">
                      {activeSeverityRules.filter(rule => 
                        rule.classification_value === 'Minor' || rule.classification_value === 'Info'
                      ).length} Rules
                    </Badge>
                  </div>
                </div>
                
                <div className="flex justify-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Settings className="h-4 w-4 mr-2" />
                        Configure Classifications
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Classification Rules Configuration</DialogTitle>
                        <DialogDescription>
                          Manage severity and category classification rules
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {classificationRules.map((rule) => (
                          <div key={rule.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-medium">{rule.rule_type.toUpperCase()}: {rule.classification_value}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Pattern: {rule.condition_pattern} | Confidence: {rule.confidence_score}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={rule.is_active}
                                  onCheckedChange={(checked) => updateRuleStatus('classification', rule.id, checked)}
                                />
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {rule.source_types && (
                              <div className="text-sm">
                                <span className="font-medium">Applies to:</span> {rule.source_types.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Rule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          {/* Quality Control Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Quality Control
              </CardTitle>
              <CardDescription>
                Data validation, error handling, and processing quality assurance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Data Validation Rules</span>
                    <Badge variant="default">
                      {analysisRules.filter(r => r.analysis_type === 'quality_assurance' && r.is_active).length} Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Error Detection</span>
                    <Badge variant="default">
                      {activeNormalizationRules.some(rule => rule.transformation_rules?.error_handling) ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Duplicate Prevention</span>
                    <Badge variant="default">
                      {activeSeverityRules.length > 0 ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Quality Scoring</span>
                    <Badge variant="default">
                      {activeCategoryRules.length > 0 ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Configure Validation
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Error Handling Rules
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProcessingManagementTab;