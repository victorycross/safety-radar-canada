
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Cloud } from 'lucide-react';

const WeatherAlertsTab = () => {
  const weatherUrl = "https://weather.gc.ca/?layers=alert,,lightning&zoom=3&center=55.53626683,-83.23680290";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather Alerts Dashboard
          </h3>
          <p className="text-muted-foreground">
            Live weather alerts and conditions from Environment and Climate Change Canada
          </p>
        </div>
        
        <a
          href={weatherUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
        >
          <ExternalLink className="h-4 w-4" />
          Open in new tab
        </a>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Environment Canada Weather Alerts</CardTitle>
          <CardDescription>
            Real-time weather alerts, warnings, and lightning data across Canada
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full h-[800px] border rounded-lg overflow-hidden">
            <iframe
              src={weatherUrl}
              className="w-full h-full border-0"
              title="Environment Canada Weather Alerts"
              allowFullScreen
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherAlertsTab;
