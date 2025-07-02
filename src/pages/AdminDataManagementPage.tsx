
import React from 'react';
import DataManagementTab from '@/components/admin/DataManagementTab';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

const AdminDataManagementPage = () => {
  return (
    <RoleProtectedRoute 
      allowedRoles={['admin', 'power_user']}
      fallbackMessage="Access to Data Management requires Administrator or Power User privileges."
    >
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Data Management</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive data management including inputs, processing, and outputs
          </p>
        </div>
        <DataManagementTab />
      </div>
    </RoleProtectedRoute>
  );
};

export default AdminDataManagementPage;
