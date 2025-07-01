
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import PipelineFlowVisualization from './pipeline-diagnostics/PipelineFlowVisualization';
import PipelineStageCard from './pipeline-diagnostics/PipelineStageCard';
import PipelineStatusAlert from './pipeline-diagnostics/PipelineStatusAlert';
import ConfigurationHelp from './pipeline-diagnostics/ConfigurationHelp';
import { usePipelineDiagnostics } from './pipeline-diagnostics/usePipelineDiagnostics';

const DataPipelineDiagnostics = () => {
  const { pipeline, loading, diagnoseDataPipeline } = usePipelineDiagnostics();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Data Pipeline Status</h2>
          <p className="text-muted-foreground">
            Monitor the flow of data from alert sources to storage
          </p>
        </div>
        <Button onClick={diagnoseDataPipeline} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
      </div>

      {/* Management Actions Notice */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Need to take action?</strong> Use the <strong>Command Center</strong> tab for testing, queue processing, and automation setup.
        </AlertDescription>
      </Alert>

      {/* Overall Status Alert */}
      <PipelineStatusAlert pipeline={pipeline} />

      {/* Pipeline Flow Visualization */}
      <PipelineFlowVisualization pipeline={pipeline} />

      {/* Detailed Stage Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pipeline.map((stage) => (
          <PipelineStageCard key={stage.name} stage={stage} />
        ))}
      </div>

      {/* Configuration Help */}
      <ConfigurationHelp />
    </div>
  );
};

export default DataPipelineDiagnostics;
