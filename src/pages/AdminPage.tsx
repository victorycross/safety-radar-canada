
import React, { useState, useEffect } from 'react';
import AdminTabs from '@/components/admin/AdminTabs';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('operations');

  // Handle URL query parameters for tab navigation with updated tab names
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    
    // Map old tab names to new simplified structure
    const tabMapping: Record<string, string> = {
      'command-center': 'operations',
      'data-sources': 'data-management',
      'operations': 'data-management',
      'monitoring': 'system-health',
      'settings': 'documentation',
      'overview': 'operations',
      'users': 'user-management'
    };
    
    if (tabParam) {
      const mappedTab = tabMapping[tabParam] || tabParam;
      // Validate the tab exists
      const validTabs = ['operations', 'data-management', 'system-health', 'security-risks', 'archive-management', 'user-management', 'documentation'];
      if (validTabs.includes(mappedTab)) {
        setActiveTab(mappedTab);
      }
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
            Comprehensive administration hub for operations, data management, user management, and system oversight
          </p>
        </div>
        <AdminTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </RoleProtectedRoute>
  );
};

export default AdminPage;
