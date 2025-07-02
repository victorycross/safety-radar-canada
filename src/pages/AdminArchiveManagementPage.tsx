
import React from 'react';
import ArchiveManagementTab from '@/components/admin/ArchiveManagementTab';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

const AdminArchiveManagementPage = () => {
  return (
    <RoleProtectedRoute 
      allowedRoles={['admin', 'power_user']}
      fallbackMessage="Access to Archive Management requires Administrator or Power User privileges."
    >
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Archive Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage archived data, retention policies, and historical records
          </p>
        </div>
        <ArchiveManagementTab />
      </div>
    </RoleProtectedRoute>
  );
};

export default AdminArchiveManagementPage;
