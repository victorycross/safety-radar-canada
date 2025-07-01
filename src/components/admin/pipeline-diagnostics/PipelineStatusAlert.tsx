
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface PipelineStage {
  name: string;
  status: 'success' | 'warning' | 'error' | 'unknown';
  count: number;
  lastActivity: string | null;
  issues: string[];
}

interface PipelineStatusAlertProps {
  pipeline: PipelineStage[];
}

const PipelineStatusAlert: React.FC<PipelineStatusAlertProps> = ({ pipeline }) => {
  const hasErrors = pipeline.some(stage => stage.status === 'error');
  const hasWarnings = pipeline.some(stage => stage.status === 'warning');

  if (hasErrors) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Critical Issues Detected:</strong> The data pipeline has errors that prevent proper data flow.
          Common issues: Missing API keys (OpenWeatherMap), incorrect API endpoints, RSS parsing problems, or stuck queue items.
        </AlertDescription>
      </Alert>
    );
  }

  if (hasWarnings) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Performance Issues:</strong> Some pipeline stages have warnings that may impact data processing efficiency.
          This often indicates RSS feeds returning 0 items, API configuration issues, or pending queue items.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <strong>Pipeline Healthy:</strong> All stages are functioning correctly and data is flowing as expected.
      </AlertDescription>
    </Alert>
  );
};

export default PipelineStatusAlert;
