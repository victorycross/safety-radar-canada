
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Activity, CheckCircle } from 'lucide-react';
import { AlertSource } from '@/types/dataIngestion';

interface FeedManagementStatsProps {
  feeds: AlertSource[];
}

const FeedManagementStats: React.FC<FeedManagementStatsProps> = ({ feeds }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Feeds</CardTitle>
          <Database className="h-4 w-4 ml-auto text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{feeds.length}</div>
          <p className="text-xs text-muted-foreground">
            Configured data sources
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Feeds</CardTitle>
          <Activity className="h-4 w-4 ml-auto text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {feeds.filter(f => f.is_active).length}
          </div>
          <p className="text-xs text-muted-foreground">
            Currently polling
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Healthy Feeds</CardTitle>
          <CheckCircle className="h-4 w-4 ml-auto text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {feeds.filter(f => f.health_status === 'healthy').length}
          </div>
          <p className="text-xs text-muted-foreground">
            Operating normally
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedManagementStats;
