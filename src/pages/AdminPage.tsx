
import React, { useState, useEffect } from 'react';
import AdminTabs from '@/components/admin/AdminTabs';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('command-center');

  // Handle URL query parameters for tab navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const newUrl = `${window.location.pathname}?tab=${tab}`;
    window.history.replaceState({}, '', newUrl);
  };

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
        <AdminTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </RoleProtectedRoute>
  );
};

export default AdminPage;
