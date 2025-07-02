
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDataProcessingConfig } from '@/hooks/useDataProcessingConfig';
import { 
  Settings, 
  Zap, 
  Shield, 
  Target, 
  CheckCircle,
  AlertTriangle,
  Database,
  Filter,
  Plus,
  Edit
} from 'lucide-react';

const ProcessingManagementTab = () => {
  const { 
    normalizationRules, 
    classificationRules, 
    loading, 
    error, 
    updateRuleStatus, 
    getActiveRulesByCategory,
    getActiveNormalizationRulesBySource,
    getActiveClassificationRulesByType
  } = useDataProcessingConfig();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const activeNormalizationRules = normalizationRules.filter(rule => rule.is_active);
  const activeSeverityRules = classificationRules.filter(rule => rule.rule_type === 'severity' && rule.is_active);
  const activeCategoryRules = classificationRules.filter(rule => rule.rule_type === 'category' && rule.is_active);

  if (loading) {
    return <div className="p-6">Loading configuration rules...</div>;
  }

  if (error) {
    return <div className="p-6 text-destructive">Error loading rules: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Data Processing Management</h3>
        <p className="text-muted-foreground">
          Configure normalization, classification, and analysis rules for incoming data
        </p>
      </div>

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

      {/* Analysis Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Analysis Configuration
          </CardTitle>
          <CardDescription>
            Risk assessment rules, correlation settings, and automated analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Risk Assessment Engine</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Correlation Analysis</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Trend Detection</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Automated Scoring</span>
                <Badge variant="default">Active</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Button className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Configure Analysis Rules
              </Button>
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Advanced Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Assessment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Assessment Tools
          </CardTitle>
          <CardDescription>
            Threat evaluation, safety protocols, and security impact analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Shield className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Threat Evaluation</div>
                  <div className="text-xs opacity-75">Assess security threats</div>
                </div>
              </Button>

              <Button variant="outline" className="h-20 flex-col gap-2">
                <CheckCircle className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Safety Protocols</div>
                  <div className="text-xs opacity-75">Define response procedures</div>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <Badge variant="default">{classificationRules.length} Total</Badge>
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
    </div>
  );
};

export default ProcessingManagementTab;
