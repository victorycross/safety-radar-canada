
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Database } from 'lucide-react';

interface PipelineStage {
  name: string;
  status: 'success' | 'warning' | 'error' | 'unknown';
  count: number;
  lastActivity: string | null;
  issues: string[];
}

interface PipelineStageCardProps {
  stage: PipelineStage;
}

const PipelineStageCard: React.FC<PipelineStageCardProps> = ({ stage }) => {
  const getStageIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Database className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      warning: 'secondary', 
      error: 'destructive',
      unknown: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  return (
    <Card className={`${
      stage.status === 'error' ? 'border-red-200' : 
      stage.status === 'warning' ? 'border-yellow-200' : 
      'border-green-200'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{stage.name}</CardTitle>
          {getStageIcon(stage.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Status:</span>
          {getStatusBadge(stage.status)}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Records (24h):</span>
          <span className="font-medium">{stage.count}</span>
        </div>

        {stage.lastActivity && (
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Last Activity:</span>
            <p className="text-xs">{new Date(stage.lastActivity).toLocaleString()}</p>
          </div>
        )}

        {stage.issues.length > 0 && (
          <div className="space-y-1">
            <span className="text-sm font-medium text-red-600">Issues:</span>
            {stage.issues.map((issue, idx) => (
              <p key={idx} className="text-xs text-red-600">{issue}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PipelineStageCard;
