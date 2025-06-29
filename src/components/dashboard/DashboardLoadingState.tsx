
import React from 'react';
import { Loader2 } from 'lucide-react';

const DashboardLoadingState = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading security dashboard data...</p>
      </div>
    </div>
  );
};

export default DashboardLoadingState;
