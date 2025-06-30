
import React, { useState } from 'react';
import AdminTabs from '@/components/admin/AdminTabs';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage system configuration, data sources, and monitoring
        </p>
      </div>
      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default AdminPage;
