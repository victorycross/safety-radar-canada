
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DiagnosticResult } from '../types';
import { getStatusIcon } from '../utils/diagnosticUtils';

interface DiagnosticResultCardProps {
  result: DiagnosticResult;
}

const DiagnosticResultCard: React.FC<DiagnosticResultCardProps> = ({ result }) => {
  const StatusIcon = getStatusIcon(result.status);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'default';
      case 'fail': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'default';
    }
  };

  const getAlertVariant = (status: string): 'default' | 'destructive' => {
    return status === 'fail' ? 'destructive' : 'default';
  };

  return (
    <Alert variant={getAlertVariant(result.status)}>
      <StatusIcon className="h-4 w-4" />
      <AlertDescription>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <strong>{result.name}</strong>
            <p className="text-sm mt-1">{result.message}</p>
            {result.details && result.details.length > 0 && (
              <ul className="text-xs mt-2 space-y-1">
                {result.details.map((detail, index) => (
                  <li key={index} className="text-muted-foreground">• {detail}</li>
                ))}
              </ul>
            )}
          </div>
          <Badge variant={getStatusColor(result.status)} className="ml-2">
            {result.status.toUpperCase()}
          </Badge>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DiagnosticResultCard;
