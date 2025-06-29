
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
      case 'cse-cybersecurity':
        return {
          description: 'Canadian Cyber Security Centre (CSE) RSS feed for cybersecurity alerts',
          apiKeyLabel: 'API Key (Optional)',
          apiKeyPlaceholder: 'Usually not required for public RSS feeds',
          endpointDefault: 'https://cyber.gc.ca/webservice/en/rss/alerts',
          helpText: 'CSE RSS feed provides cybersecurity alerts with automatic geolocation classification. No authentication typically required for public feeds.',
          pollIntervalDefault: '600',
          pollIntervalNote: 'Recommended: 10 minutes (600 seconds) for cybersecurity alerts'
        };
      case 'weather-ca-geocmet':
        return {
          description: 'Environment Canada GeoMet-OGC API for weather alerts in GeoJSON format',
          apiKeyLabel: 'API Key (Optional)',
          apiKeyPlaceholder: 'Usually not required for public weather alerts',
          endpointDefault: 'https://api.weather.gc.ca/collections/alerts-fc/items',
          helpText: 'GeoMet-OGC API provides weather alerts with geographic data in GeoJSON format. No authentication typically required for public alerts.',
          pollIntervalDefault: '300',
          pollIntervalNote: 'Recommended: 5 minutes (300 seconds) for weather alerts'
        };
      case 'weather-ca':
        return {
          description: 'Environment Canada Weather API requires authentication for full access',
          apiKeyLabel: 'Environment Canada API Key',
          apiKeyPlaceholder: 'Enter your Environment Canada API key',
          endpointDefault: 'https://weather.gc.ca/rss/warning/on_e.xml',
          helpText: 'You can obtain an API key from Environment and Climate Change Canada\'s web services portal',
          pollIntervalDefault: '300',
          pollIntervalNote: 'Standard polling interval for weather data'
        };
      case 'social-media':
        return {
          description: 'Social Media Monitoring requires API keys for various platforms',
          apiKeyLabel: 'Social Media API Keys (JSON)',
          apiKeyPlaceholder: '{"twitter": "key", "facebook": "key"}',
          endpointDefault: 'Multiple platforms',
          helpText: 'Configure API keys for Twitter, Facebook, and other social media platforms in JSON format',
          pollIntervalDefault: '600',
          pollIntervalNote: 'Social media can be polled less frequently'
        };
      case 'everbridge':
        return {
          description: 'Everbridge requires API credentials for access',
          apiKeyLabel: 'Everbridge API Credentials',
          apiKeyPlaceholder: 'username:password:orgId',
          endpointDefault: 'https://api.everbridge.net/rest/broadcasts',
          helpText: 'Format: username:password:organizationId',
          pollIntervalDefault: '300',
          pollIntervalNote: 'Emergency alerts should be checked frequently'
        };
      case 'cisa-alerts':
        return {
          description: 'CISA Security Alerts - Usually works without API key',
          apiKeyLabel: 'API Key (Optional)',
          apiKeyPlaceholder: 'Not typically required',
          endpointDefault: 'https://www.cisa.gov/cybersecurity-advisories/all.xml',
          helpText: 'CISA RSS feeds are typically public and don\'t require authentication',
          pollIntervalDefault: '1800',
          pollIntervalNote: 'Security advisories can be checked every 30 minutes'
        };
      case 'alert-ready':
        return {
          description: 'Alert Ready Canada - Public emergency alerts',
          apiKeyLabel: 'API Key (Optional)',
          apiKeyPlaceholder: 'Not typically required',
          endpointDefault: 'https://alerts.pelmorex.com/rss',
          helpText: 'Alert Ready feeds are public emergency alerts and typically don\'t require authentication',
          pollIntervalDefault: '300',
          pollIntervalNote: 'Emergency alerts should be checked frequently'
        };
      case 'bc-arcgis':
        return {
          description: 'BC ArcGIS Emergency Data - Public GIS services',
          apiKeyLabel: 'API Key (Optional)',
          apiKeyPlaceholder: 'Not typically required',
          endpointDefault: 'BC ArcGIS Emergency Services API',
          helpText: 'BC government emergency data is typically publicly accessible',
          pollIntervalDefault: '600',
          pollIntervalNote: 'GIS data can be updated less frequently'
        };
      default:
        return {
          description: 'Configure this data source',
          apiKeyLabel: 'API Key',
          apiKeyPlaceholder: 'Enter API key if required',
          endpointDefault: '',
          helpText: 'Configure the data source settings',
          pollIntervalDefault: '300',
          pollIntervalNote: 'Standard polling interval'
        };
    }
  };

  const details = getConfigDetails(feedId);

  React.useEffect(() => {
    setConfig(prev => ({
      ...prev,
      endpoint: details.endpointDefault,
      pollInterval: details.pollIntervalDefault
    }));
  }, [feedId]);

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
                <Label htmlFor="pollInterval">
                  Poll Interval (seconds)
                  {(feedId === 'weather-ca-geocmet' || feedId === 'cse-cybersecurity') && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {feedId === 'cse-cybersecurity' ? '10min recommended' : '5min recommended'}
                    </Badge>
                  )}
                </Label>
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
                <div className="text-xs text-muted-foreground mt-1">
                  {details.pollIntervalNote}
                </div>
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

            <div>
              <Label htmlFor="retries">Max Retries</Label>
              <Select value={config.retries} onValueChange={(value) => setConfig(prev => ({ ...prev, retries: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 retry</SelectItem>
                  <SelectItem value="3">3 retries</SelectItem>
                  <SelectItem value="5">5 retries</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground mt-1">
                Number of retry attempts for failed requests
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
