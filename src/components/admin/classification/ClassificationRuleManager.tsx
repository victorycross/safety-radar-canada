import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Target, 
  TestTube, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  BarChart3, 
  AlertTriangle,
  Shield,
  CheckCircle,
  FileText,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { useDataProcessingConfig } from '@/hooks/useDataProcessingConfig';
import { useToast } from '@/hooks/use-toast';
import ClassificationTester from './ClassificationTester';
import ClassificationAnalytics from './ClassificationAnalytics';
import RuleHierarchyManager from './RuleHierarchyManager';

interface ClassificationRuleManagerProps {
  onRuleUpdate?: () => void;
}

const ClassificationRuleManager: React.FC<ClassificationRuleManagerProps> = ({ onRuleUpdate }) => {
  const [activeTab, setActiveTab] = useState('rules');
  const [selectedRule, setSelectedRule] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    rule_type: 'severity',
    condition_pattern: '',
    classification_value: '',
    confidence_score: 1.0,
    priority: 100,
    source_types: [],
    is_active: true
  });

  const { 
    classificationRules, 
    loading, 
    error, 
    updateRuleStatus,
    createClassificationRule,
    getActiveClassificationRulesByType
  } = useDataProcessingConfig();

  const { toast } = useToast();

  const handleCreateRule = async () => {
    try {
      await createClassificationRule(newRule);
      setIsCreateDialogOpen(false);
      setNewRule({
        rule_type: 'severity',
        condition_pattern: '',
        classification_value: '',
        confidence_score: 1.0,
        priority: 100,
        source_types: [],
        is_active: true
      });
      onRuleUpdate?.();
      toast({
        title: 'Success',
        description: 'Classification rule created successfully'
      });
    } catch (error) {
      console.error('Error creating rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to create classification rule',
        variant: 'destructive'
      });
    }
  };

  const getRulesByType = (type: string) => {
    return classificationRules.filter(rule => rule.rule_type === type);
  };

  const getActiveRuleCount = (type: string) => {
    return classificationRules.filter(rule => rule.rule_type === type && rule.is_active).length;
  };

  const severityRules = getRulesByType('severity');
  const categoryRules = getRulesByType('category');
  const impactRules = getRulesByType('impact');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Classification Rule Manager</h2>
          <p className="text-muted-foreground">
            Advanced management for alert classification patterns and rules
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Classification Rule</DialogTitle>
                <DialogDescription>
                  Define a new pattern-based classification rule
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rule_type">Rule Type</Label>
                    <Select 
                      value={newRule.rule_type} 
                      onValueChange={(value) => setNewRule({...newRule, rule_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="severity">Severity</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="impact">Impact</SelectItem>
                        <SelectItem value="source">Source</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="classification_value">Classification Value</Label>
                    <Input
                      value={newRule.classification_value}
                      onChange={(e) => setNewRule({...newRule, classification_value: e.target.value})}
                      placeholder="e.g., Severe, Weather, High"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="condition_pattern">Pattern (Regex)</Label>
                  <Input
                    value={newRule.condition_pattern}
                    onChange={(e) => setNewRule({...newRule, condition_pattern: e.target.value})}
                    placeholder="e.g., (extreme|severe|critical)"
                    className="font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="confidence_score">Confidence Score</Label>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={newRule.confidence_score}
                      onChange={(e) => setNewRule({...newRule, confidence_score: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      type="number"
                      value={newRule.priority}
                      onChange={(e) => setNewRule({...newRule, priority: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newRule.is_active}
                    onCheckedChange={(checked) => setNewRule({...newRule, is_active: checked})}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRule}>
                    Create Rule
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Rule Type Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Severity Rules</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{getActiveRuleCount('severity')}</p>
                  <Badge variant="outline">{severityRules.length} total</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category Rules</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{getActiveRuleCount('category')}</p>
                  <Badge variant="outline">{categoryRules.length} total</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Impact Rules</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{getActiveRuleCount('impact')}</p>
                  <Badge variant="outline">{impactRules.length} total</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rules">Rules Management</TabsTrigger>
          <TabsTrigger value="tester">Pattern Tester</TabsTrigger>
          <TabsTrigger value="hierarchy">Rule Hierarchy</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Classification Rules
              </CardTitle>
              <CardDescription>
                Manage and configure all classification rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classificationRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Badge variant={rule.rule_type === 'severity' ? 'destructive' : 
                                     rule.rule_type === 'category' ? 'default' : 'secondary'}>
                          {rule.rule_type.toUpperCase()}
                        </Badge>
                        <div>
                          <h4 className="font-medium">{rule.classification_value}</h4>
                          <p className="text-sm text-muted-foreground">
                            Priority: {rule.priority} | Confidence: {rule.confidence_score}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={(checked) => updateRuleStatus('classification', rule.id, checked)}
                        />
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted p-3 rounded text-sm font-mono">
                      {rule.condition_pattern}
                    </div>
                    {rule.source_types && rule.source_types.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm font-medium">Applies to: </span>
                        {rule.source_types.map((type, index) => (
                          <Badge key={index} variant="outline" className="mr-1">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tester">
          <ClassificationTester rules={classificationRules} />
        </TabsContent>

        <TabsContent value="hierarchy">
          <RuleHierarchyManager rules={classificationRules} onUpdate={onRuleUpdate} />
        </TabsContent>

        <TabsContent value="analytics">
          <ClassificationAnalytics rules={classificationRules} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassificationRuleManager;