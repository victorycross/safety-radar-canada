
import React from 'react';
import UserManagementTab from '@/components/admin/UserManagementTab';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

const AdminUserManagementPage = () => {
  return (
    <RoleProtectedRoute 
      allowedRoles={['admin']}
      fallbackMessage="Access to User Management requires Administrator privileges."
    >
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage users, roles, permissions, and access control
          </p>
        </div>
        <UserManagementTab />
      </div>
    </RoleProtectedRoute>
  );
};

export default AdminUserManagementPage;
