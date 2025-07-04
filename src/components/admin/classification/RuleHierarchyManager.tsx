import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowUp, 
  ArrowDown, 
  Layers, 
  Link2, 
  Save, 
  RotateCcw,
  AlertTriangle,
  Shield,
  Target
} from 'lucide-react';
import { ClassificationRule } from '@/hooks/useDataProcessingConfig';
import { useToast } from '@/hooks/use-toast';

interface RuleHierarchyManagerProps {
  rules: ClassificationRule[];
  onUpdate?: () => void;
}

interface HierarchyGroup {
  type: string;
  rules: ClassificationRule[];
  order: number;
}

const RuleHierarchyManager: React.FC<RuleHierarchyManagerProps> = ({ rules, onUpdate }) => {
  const [hierarchyGroups, setHierarchyGroups] = useState<HierarchyGroup[]>([]);
  const [processingOrder, setProcessingOrder] = useState<string[]>(['severity', 'category', 'impact', 'source']);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    // Group rules by type and sort by priority
    const groups: HierarchyGroup[] = processingOrder.map((type, index) => ({
      type,
      rules: rules
        .filter(rule => rule.rule_type === type)
        .sort((a, b) => b.priority - a.priority),
      order: index
    }));
    
    setHierarchyGroups(groups);
  }, [rules, processingOrder]);

  const updateRulePriority = (ruleId: string, newPriority: number) => {
    setHierarchyGroups(prev => 
      prev.map(group => ({
        ...group,
        rules: group.rules.map(rule => 
          rule.id === ruleId 
            ? { ...rule, priority: newPriority }
            : rule
        ).sort((a, b) => b.priority - a.priority)
      }))
    );
    setHasChanges(true);
  };

  const moveRuleUp = (groupType: string, ruleId: string) => {
    const group = hierarchyGroups.find(g => g.type === groupType);
    if (!group) return;

    const ruleIndex = group.rules.findIndex(r => r.id === ruleId);
    if (ruleIndex <= 0) return;

    const rule = group.rules[ruleIndex];
    const higherRule = group.rules[ruleIndex - 1];
    
    updateRulePriority(rule.id, higherRule.priority + 1);
  };

  const moveRuleDown = (groupType: string, ruleId: string) => {
    const group = hierarchyGroups.find(g => g.type === groupType);
    if (!group) return;

    const ruleIndex = group.rules.findIndex(r => r.id === ruleId);
    if (ruleIndex >= group.rules.length - 1) return;

    const rule = group.rules[ruleIndex];
    const lowerRule = group.rules[ruleIndex + 1];
    
    updateRulePriority(rule.id, lowerRule.priority - 1);
  };

  const updateProcessingOrder = (newOrder: string[]) => {
    setProcessingOrder(newOrder);
    setHasChanges(true);
  };

  const saveChanges = async () => {
    try {
      // Here you would implement the actual save logic
      // For now, we'll just simulate it
      toast({
        title: 'Success',
        description: 'Rule hierarchy updated successfully'
      });
      setHasChanges(false);
      onUpdate?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update rule hierarchy',
        variant: 'destructive'
      });
    }
  };

  const resetChanges = () => {
    setProcessingOrder(['severity', 'category', 'impact', 'source']);
    setHasChanges(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'severity': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'category': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'impact': return <Target className="h-4 w-4 text-green-500" />;
      default: return <Layers className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'severity': return 'Determines alert severity levels (Extreme, Severe, Moderate, Minor)';
      case 'category': return 'Classifies alert categories (Weather, Security, Travel, etc.)';
      case 'impact': return 'Assesses potential impact scope and affected populations';
      default: return 'Other classification rules';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Rule Hierarchy & Processing Order</h3>
          <p className="text-sm text-muted-foreground">
            Configure the order and priority of classification rules
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <>
              <Button variant="outline" onClick={resetChanges}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={saveChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Processing Order Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Processing Order
          </CardTitle>
          <CardDescription>
            Rules are processed in this order. Higher priority rules within each type are evaluated first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {processingOrder.map((type, index) => (
              <div key={type} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(type)}
                    <span className="font-medium capitalize">{type}</span>
                  </div>
                  <Badge variant="outline">Step {index + 1}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {getTypeDescription(type)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rule Groups */}
      {hierarchyGroups.map((group) => (
        <Card key={group.type}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getTypeIcon(group.type)}
              {group.type.charAt(0).toUpperCase() + group.type.slice(1)} Rules
              <Badge variant="secondary">{group.rules.length} rules</Badge>
            </CardTitle>
            <CardDescription>
              Rules are processed by priority (highest to lowest)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {group.rules.map((rule, index) => (
                <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="font-mono">
                      #{rule.priority}
                    </Badge>
                    <div>
                      <div className="font-medium">{rule.classification_value}</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {rule.condition_pattern.length > 50 
                          ? rule.condition_pattern.substring(0, 50) + '...'
                          : rule.condition_pattern
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveRuleUp(group.type, rule.id)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveRuleDown(group.type, rule.id)}
                        disabled={index === group.rules.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={rule.priority}
                        onChange={(e) => updateRulePriority(rule.id, parseInt(e.target.value) || 0)}
                        className="w-20 text-center"
                        min="0"
                        max="1000"
                      />
                    </div>
                    
                    <Switch checked={rule.is_active} />
                    
                    <Badge 
                      variant={rule.confidence_score >= 0.8 ? 'default' : 'secondary'}
                      className="min-w-16"
                    >
                      {(rule.confidence_score * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
              
              {group.rules.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No {group.type} rules configured
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Rule Dependencies Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Rule Dependencies
          </CardTitle>
          <CardDescription>
            Visualization of how rules interact and depend on each other
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Rule dependency mapping coming soon</p>
            <p className="text-sm">This will show how rules cascade and interact</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RuleHierarchyManager;