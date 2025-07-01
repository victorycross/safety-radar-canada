
import React, { useState } from 'react';
import AdminTabs from '@/components/admin/AdminTabs';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <RoleProtectedRoute 
      allowedRoles={['admin', 'power_user']}
      fallbackMessage="Access to the Admin Dashboard requires Administrator or Power User privileges."
    >
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage system configuration, operations, and monitoring
          </p>
        </div>
        <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </RoleProtectedRoute>
  );
};

export default AdminPage;
