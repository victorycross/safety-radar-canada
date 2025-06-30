
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DiagnosticResult } from '../types';
import { getStatusIcon, getStatusVariant } from '../utils/diagnosticUtils';

interface DiagnosticResultCardProps {
  result: DiagnosticResult;
}

const DiagnosticResultCard: React.FC<DiagnosticResultCardProps> = ({ result }) => {
  const StatusIcon = getStatusIcon(result.status);

  return (
    <div className="flex items-start justify-between p-3 border rounded-lg">
      <div className="flex items-start space-x-3 flex-1">
        {StatusIcon && <StatusIcon className="h-5 w-5 text-inherit mt-0.5" />}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{result.name}</h4>
            <Badge variant={getStatusVariant(result.status)}>
              {result.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
          {result.details && result.details.length > 0 && (
            <div className="mt-2">
              {result.details.map((detail, idx) => (
                <p key={idx} className="text-xs text-muted-foreground">• {detail}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticResultCard;
