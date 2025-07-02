
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { SecurityConfigService, SecurityConfig } from '@/services/securityConfigService';
import { Settings, Shield, Clock, Globe } from 'lucide-react';

const ConfigurationTab = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<SecurityConfig>(SecurityConfigService['defaultConfig']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const currentConfig = await SecurityConfigService.getConfig();
      setConfig(currentConfig);
    } catch (error) {
      console.error('Failed to load security config:', error);
      toast({
        title: 'Error',
        description: 'Failed to load security configuration',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await SecurityConfigService.updateConfig(config);
      toast({
        title: 'Success',
        description: 'Security configuration updated successfully',
      });
    } catch (error) {
      console.error('Failed to save config:', error);
      toast({
        title: 'Error',
        description: 'Failed to save security configuration',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: keyof SecurityConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div className="p-4">Loading configuration...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Management
          </CardTitle>
          <CardDescription>
            Configure session timeout and concurrent session limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={config.sessionTimeout}
                onChange={(e) => updateConfig('sessionTimeout', parseInt(e.target.value))}
                min="5"
                max="480"
              />
            </div>
            <div>
              <Label htmlFor="maxConcurrentSessions">Max Concurrent Sessions</Label>
              <Input
                id="maxConcurrentSessions"
                type="number"
                value={config.maxConcurrentSessions}
                onChange={(e) => updateConfig('maxConcurrentSessions', parseInt(e.target.value))}
                min="1"
                max="10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Rate Limiting
          </CardTitle>
          <CardDescription>
            Configure API rate limiting and request throttling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rateLimitWindow">Rate Limit Window (seconds)</Label>
              <Input
                id="rateLimitWindow"
                type="number"
                value={config.rateLimitWindow}
                onChange={(e) => updateConfig('rateLimitWindow', parseInt(e.target.value))}
                min="10"
                max="3600"
              />
            </div>
            <div>
              <Label htmlFor="maxRequestsPerWindow">Max Requests per Window</Label>
              <Input
                id="maxRequestsPerWindow"
                type="number"
                value={config.maxRequestsPerWindow}
                onChange={(e) => updateConfig('maxRequestsPerWindow', parseInt(e.target.value))}
                min="10"
                max="1000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Geographic Security
          </CardTitle>
          <CardDescription>
            Configure geographic blocking and location-based security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="enableGeoBlocking"
              checked={config.enableGeoBlocking}
              onCheckedChange={(checked) => updateConfig('enableGeoBlocking', checked)}
            />
            <Label htmlFor="enableGeoBlocking">Enable Geographic Blocking</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Authentication
          </CardTitle>
          <CardDescription>
            Configure authentication and password requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="requireMFA"
              checked={config.requireMFA}
              onCheckedChange={(checked) => updateConfig('requireMFA', checked)}
            />
            <Label htmlFor="requireMFA">Require Multi-Factor Authentication</Label>
          </div>
          <div>
            <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
            <Input
              id="passwordMinLength"
              type="number"
              value={config.passwordMinLength}
              onChange={(e) => updateConfig('passwordMinLength', parseInt(e.target.value))}
              min="8"
              max="64"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  );
};

export default ConfigurationTab;
