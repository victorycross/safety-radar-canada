
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface FeedConfig {
  apiKey: string;
  endpoint: string;
  pollInterval: string;
  enabled: boolean;
  timeout: string;
  retries: string;
}

interface FeedDetails {
  apiKeyLabel: string;
  apiKeyPlaceholder: string;
  endpointDefault: string;
  pollIntervalNote: string;
}

interface FeedConfigFormProps {
  config: FeedConfig;
  setConfig: React.Dispatch<React.SetStateAction<FeedConfig>>;
  feedId: string;
  details: FeedDetails;
}

const FeedConfigForm: React.FC<FeedConfigFormProps> = ({ 
  config, 
  setConfig, 
  feedId, 
  details 
}) => {
  return (
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
    </div>
  );
};

export default FeedConfigForm;
