
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ConfigurationHelp: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Common Configuration Issues</CardTitle>
        <CardDescription>
          Steps to resolve typical pipeline problems
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Stuck Queue Items</h4>
          <p className="text-xs text-muted-foreground">
            • Use Command Center → "Process Queue Now" to manually clear stuck items
            • Set up automation with "Setup Automation" to prevent future backups
            • Check edge function logs for processing errors
          </p>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">OpenWeatherMap API (401 Unauthorized)</h4>
          <p className="text-xs text-muted-foreground">
            • Add your OpenWeatherMap API key to Supabase secrets as 'OPENWEATHERMAP_API_KEY'
            • Update the alert source configuration to include the API key
          </p>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Environment Canada (404 Not Found)</h4>
          <p className="text-xs text-muted-foreground">
            • Current endpoint may be incorrect. Try: https://api.weather.gc.ca/collections/alerts/items
            • Check if GeoMet API structure has changed
          </p>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">RSS Feeds Parsing 0 Items</h4>
          <p className="text-xs text-muted-foreground">
            • RSS feeds may have changed structure or be temporarily unavailable
            • Check RSS parser logic in master-ingestion-orchestrator
            • Verify RSS item extraction patterns
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigurationHelp;
