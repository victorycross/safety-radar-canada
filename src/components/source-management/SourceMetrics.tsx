
import React from 'react';

interface SourceMetricsProps {
  uptime: number;
  pollingInterval: number;
  lastPollAt: string | null;
}

const SourceMetrics: React.FC<SourceMetricsProps> = ({
  uptime,
  pollingInterval,
  lastPollAt
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Uptime</div>
          <div className="font-medium">{uptime}%</div>
        </div>
        <div>
          <div className="text-muted-foreground">Poll Interval</div>
          <div className="font-medium">{pollingInterval}s</div>
        </div>
      </div>

      <div className="text-sm">
        <div className="text-muted-foreground">Last Poll</div>
        <div className="font-medium">
          {lastPollAt 
            ? new Date(lastPollAt).toLocaleString()
            : 'Never'
          }
        </div>
      </div>
    </>
  );
};

export default SourceMetrics;
