
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ValidationSettingsProps {
  isAdmin?: boolean;
}

const ValidationSettings: React.FC<ValidationSettingsProps> = ({ isAdmin = false }) => {
  const [warningThreshold, setWarningThreshold] = useState(25);
  const [criticalThreshold, setCriticalThreshold] = useState(50);
  const [enableAdminOverride, setEnableAdminOverride] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would save to database
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Settings Saved',
        description: 'Validation thresholds have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save validation settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Settings className="h-5 w-5" />
            Validation Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Admin access required to modify validation settings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Employee Count Validation Settings
          <Badge variant="secondary">
            <Shield className="h-3 w-3 mr-1" />
            Admin Only
          </Badge>
        </CardTitle>
        <CardDescription>
          Configure validation thresholds and admin override capabilities for employee count changes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="warning-threshold">Warning Threshold (%)</Label>
            <Input
              id="warning-threshold"
              type="number"
              min="1"
              max="100"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Show warning alerts for changes above this percentage
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="critical-threshold">Critical Threshold (%)</Label>
            <Input
              id="critical-threshold"
              type="number"
              min="1"
              max="100"
              value={criticalThreshold}
              onChange={(e) => setCriticalThreshold(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Require confirmation and reason for changes above this percentage
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="admin-override-toggle" className="text-sm font-medium">
              Enable Admin Override
            </Label>
            <p className="text-xs text-muted-foreground">
              Allow administrators to bypass validation checks for urgent updates
            </p>
          </div>
          <Switch
            id="admin-override-toggle"
            checked={enableAdminOverride}
            onCheckedChange={setEnableAdminOverride}
          />
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Current Validation Tiers</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span><strong>Warning:</strong> {warningThreshold}% - {criticalThreshold - 1}% (confirmation optional)</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span><strong>Critical:</strong> {criticalThreshold}%+ (reason required)</span>
            </div>
            {enableAdminOverride && (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span><strong>Admin Override:</strong> Bypass all validation checks</span>
              </div>
            )}
          </div>
        </div>

        <Button 
          onClick={handleSaveSettings}
          disabled={loading || warningThreshold >= criticalThreshold}
          className="w-full"
        >
          {loading ? 'Saving...' : 'Save Validation Settings'}
        </Button>

        {warningThreshold >= criticalThreshold && (
          <p className="text-sm text-red-600">
            Warning threshold must be less than critical threshold
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidationSettings;
