
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

const StatusOverviewSection: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Current Status
        </CardTitle>
        <CardDescription>
          Quick overview of system status and recent operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="default">Pipeline</Badge>
            <span className="text-sm">Ready for testing</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">Queue</Badge>
            <span className="text-sm">Processing available</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">Automation</Badge>
            <span className="text-sm">Setup required</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusOverviewSection;
