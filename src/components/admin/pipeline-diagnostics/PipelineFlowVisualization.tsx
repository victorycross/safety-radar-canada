
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Database, ArrowRight } from 'lucide-react';

interface PipelineStage {
  name: string;
  status: 'success' | 'warning' | 'error' | 'unknown';
  count: number;
  lastActivity: string | null;
  issues: string[];
}

interface PipelineFlowVisualizationProps {
  pipeline: PipelineStage[];
}

const PipelineFlowVisualization: React.FC<PipelineFlowVisualizationProps> = ({ pipeline }) => {
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
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Flow</CardTitle>
        <CardDescription>
          Visual representation of data flow through each stage of the ingestion pipeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {pipeline.map((stage, index) => (
            <div key={stage.name} className="flex flex-col lg:flex-row items-center">
              <div className="flex flex-col items-center space-y-2 min-w-[160px]">
                <div className="flex items-center space-x-2">
                  {getStageIcon(stage.status)}
                  <span className="font-medium">{stage.name}</span>
                </div>
                
                {getStatusBadge(stage.status)}
                
                <div className="text-center">
                  <p className="text-2xl font-bold">{stage.count}</p>
                  <p className="text-xs text-muted-foreground">
                    {stage.lastActivity 
                      ? `Last: ${new Date(stage.lastActivity).toLocaleString()}`
                      : 'No activity'
                    }
                  </p>
                </div>

                {stage.issues.length > 0 && (
                  <div className="text-xs text-red-600 text-center">
                    {stage.issues.map((issue, idx) => (
                      <p key={idx}>{issue}</p>
                    ))}
                  </div>
                )}
              </div>
              
              {index < pipeline.length - 1 && (
                <ArrowRight className="h-6 w-6 text-muted-foreground hidden lg:block mx-2" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PipelineFlowVisualization;
