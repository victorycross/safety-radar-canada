import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Globe, Key, Clock, RefreshCw } from "lucide-react";

interface SourceConfigFormProps {
  config: any;
  setConfig: (config: any) => void;
  sourceType: string;
}

const SourceConfigForm: React.FC<SourceConfigFormProps> = ({
  config,
  setConfig,
  sourceType
}) => {
  const updateConfig = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const updateAuthConfig = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      authentication: { ...prev.authentication, [field]: value }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Connection Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Connection Settings
          </CardTitle>
          <CardDescription>
            Configure the basic connection parameters for this source
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="endpoint">API Endpoint</Label>
              <Input
                id="endpoint"
                placeholder="https://api.example.com/feed"
                value={config.apiEndpoint || ''}
                onChange={(e) => updateConfig('apiEndpoint', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="method">HTTP Method</Label>
              <Select
                value={config.method || 'GET'}
                onValueChange={(value) => updateConfig('method', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={config.enabled || false}
              onCheckedChange={(checked) => updateConfig('enabled', checked)}
            />
            <Label htmlFor="enabled">Enable this source</Label>
          </div>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Authentication
          </CardTitle>
          <CardDescription>
            Configure authentication method and credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="authType">Authentication Type</Label>
            <Select
              value={config.authentication?.type || 'none'}
              onValueChange={(value) => updateAuthConfig('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="apiKey">API Key</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.authentication?.type === 'apiKey' && (
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={config.authentication.apiKey || ''}
                onChange={(e) => updateAuthConfig('apiKey', e.target.value)}
              />
            </div>
          )}

          {config.authentication?.type === 'basic' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={config.authentication.username || ''}
                  onChange={(e) => updateAuthConfig('username', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={config.authentication.password || ''}
                  onChange={(e) => updateAuthConfig('password', e.target.value)}
                />
              </div>
            </div>
          )}

          {config.authentication?.type === 'bearer' && (
            <div>
              <Label htmlFor="token">Bearer Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="Enter bearer token"
                value={config.authentication.token || ''}
                onChange={(e) => updateAuthConfig('token', e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Polling & Timeouts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Polling & Timeouts
          </CardTitle>
          <CardDescription>
            Configure polling intervals and timeout settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="pollInterval">Poll Interval (seconds)</Label>
              <Select
                value={config.pollInterval?.toString() || '300'}
                onValueChange={(value) => updateConfig('pollInterval', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                  <SelectItem value="600">10 minutes</SelectItem>
                  <SelectItem value="1800">30 minutes</SelectItem>
                  <SelectItem value="3600">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                min="5"
                max="300"
                value={config.timeout || 30}
                onChange={(e) => updateConfig('timeout', parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <Label htmlFor="retries">Max Retries</Label>
              <Select
                value={config.retries?.toString() || '3'}
                onValueChange={(value) => updateConfig('retries', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Headers */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Headers</CardTitle>
          <CardDescription>
            Add custom HTTP headers for this source (JSON format)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder='{"User-Agent": "MyApp/1.0", "Accept": "application/json"}'
            value={JSON.stringify(config.headers || {}, null, 2)}
            onChange={(e) => {
              try {
                const headers = JSON.parse(e.target.value);
                updateConfig('headers', headers);
              } catch {
                // Invalid JSON, keep previous value
              }
            }}
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SourceConfigForm;
