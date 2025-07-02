
import React from 'react';
import OperationsTab from '@/components/admin/OperationsTab';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

const AdminOperationsPage = () => {
  return (
    <RoleProtectedRoute 
      allowedRoles={['admin', 'power_user']}
      fallbackMessage="Access to Operations requires Administrator or Power User privileges."
    >
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Operations</h1>
          <p className="text-muted-foreground mt-2">
            Command center for daily operations, quick actions, and system management
          </p>
        </div>
        <OperationsTab />
      </div>
    </RoleProtectedRoute>
  );
};

export default AdminOperationsPage;
