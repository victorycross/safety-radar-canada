
import React from 'react';
import SystemDiagnostics from '@/components/diagnostics/SystemDiagnostics';

const DiagnosticsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <SystemDiagnostics />
    </div>
  );
};

export default DiagnosticsPage;
