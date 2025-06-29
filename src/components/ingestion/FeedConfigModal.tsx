
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  Key, 
  Globe, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

interface FeedConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedId: string;
  feedName: string;
}

const FeedConfigModal: React.FC<FeedConfigModalProps> = ({ 
  isOpen, 
  onClose, 
  feedId, 
  feedName 
}) => {
  const [config, setConfig] = useState({
    apiKey: '',
    endpoint: '',
    pollInterval: '300',
    enabled: true,
    timeout: '30',
    retries: '3'
  });

  const getConfigDetails = (feedId: string) => {
    switch (feedId) {
      case 'weather-ca':
        return {
          description: 'Environment Canada Weather API requires authentication for full access',
          apiKeyLabel: 'Environment Canada API Key',
          apiKeyPlaceholder: 'Enter your Environment Canada API key',
          endpointDefault: 'https://weather.gc.ca/rss/warning/on_e.xml',
          helpText: 'You can obtain an API key from Environment and Climate Change Canada\'s web services portal'
        };
      case 'social-media':
        return {
          description: 'Social Media Monitoring requires API keys for various platforms',
          apiKeyLabel: 'Social Media API Keys (JSON)',
          apiKeyPlaceholder: '{"twitter": "key", "facebook": "key"}',
          endpointDefault: 'Multiple platforms',
          helpText: 'Configure API keys for Twitter, Facebook, and other social media platforms in JSON format'
        };
      case 'everbridge':
        return {
          description: 'Everbridge requires API credentials for access',
          apiKeyLabel: 'Everbridge API Credentials',
          apiKeyPlaceholder: 'username:password:orgId',
          endpointDefault: 'https://api.everbridge.net/rest/broadcasts',
          helpText: 'Format: username:password:organizationId'
        };
      case 'cisa-alerts':
        return {
          description: 'CISA Security Alerts - Usually works without API key',
          apiKeyLabel: 'API Key (Optional)',
          apiKeyPlaceholder: 'Not typically required',
          endpointDefault: 'https://www.cisa.gov/cybersecurity-advisories/all.xml',
          helpText: 'CISA RSS feeds are typically public and don\'t require authentication'
        };
      case 'alert-ready':
        return {
          description: 'Alert Ready Canada - Public emergency alerts',
          apiKeyLabel: 'API Key (Optional)',
          apiKeyPlaceholder: 'Not typically required',
          endpointDefault: 'https://alerts.pelmorex.com/rss',
          helpText: 'Alert Ready feeds are public emergency alerts and typically don\'t require authentication'
        };
      case 'bc-arcgis':
        return {
          description: 'BC ArcGIS Emergency Data - Public GIS services',
          apiKeyLabel: 'API Key (Optional)',
          apiKeyPlaceholder: 'Not typically required',
          endpointDefault: 'BC ArcGIS Emergency Services API',
          helpText: 'BC government emergency data is typically publicly accessible'
        };
      default:
        return {
          description: 'Configure this data source',
          apiKeyLabel: 'API Key',
          apiKeyPlaceholder: 'Enter API key if required',
          endpointDefault: '',
          helpText: 'Configure the data source settings'
        };
    }
  };

  const details = getConfigDetails(feedId);

  const handleSave = () => {
    console.log('Saving configuration for', feedId, config);
    // Here you would typically save to a backend or local storage
    // For now, just close the modal
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Configure {feedName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {details.description}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div>
              <Label htmlFor="apiKey">{details.apiKeyLabel}</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder={details.apiKeyPlaceholder}
                value={config.apiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="endpoint">Endpoint URL</Label>
              <Input
                id="endpoint"
                placeholder={details.endpointDefault}
                value={config.endpoint}
                onChange={(e) => setConfig(prev => ({ ...prev, endpoint: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pollInterval">Poll Interval (seconds)</Label>
                <Select value={config.pollInterval} onValueChange={(value) => setConfig(prev => ({ ...prev, pollInterval: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                    <SelectItem value="600">10 minutes</SelectItem>
                    <SelectItem value="1800">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timeout">Timeout (seconds)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={config.timeout}
                  onChange={(e) => setConfig(prev => ({ ...prev, timeout: e.target.value }))}
                />
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              {details.helpText}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Badge variant={config.enabled ? "default" : "secondary"}>
              {config.enabled ? "Enabled" : "Disabled"}
            </Badge>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Config
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedConfigModal;
