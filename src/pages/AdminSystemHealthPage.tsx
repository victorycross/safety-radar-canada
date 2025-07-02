
import React from 'react';
import SystemHealthTab from '@/components/admin/SystemHealthTab';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

const AdminSystemHealthPage = () => {
  return (
    <RoleProtectedRoute 
      allowedRoles={['admin', 'power_user']}
      fallbackMessage="Access to System Health requires Administrator or Power User privileges."
    >
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground mt-2">
            Monitor system performance, diagnostics, and health metrics
          </p>
        </div>
        <SystemHealthTab />
      </div>
    </RoleProtectedRoute>
  );
};

export default AdminSystemHealthPage;
