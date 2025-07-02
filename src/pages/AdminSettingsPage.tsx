
import React from 'react';
import SettingsDocumentationTab from '@/components/admin/SettingsDocumentationTab';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

const AdminSettingsPage = () => {
  return (
    <RoleProtectedRoute 
      allowedRoles={['admin', 'power_user']}
      fallbackMessage="Access to Settings & Documentation requires Administrator or Power User privileges."
    >
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings & Documentation</h1>
          <p className="text-muted-foreground mt-2">
            System configuration, security monitoring, schema health, and comprehensive documentation resources
          </p>
        </div>
        <SettingsDocumentationTab />
      </div>
    </RoleProtectedRoute>
  );
};

export default AdminSettingsPage;
