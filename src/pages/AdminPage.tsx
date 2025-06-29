
import React, { useState } from 'react';
import AdminTabs from '@/components/admin/AdminTabs';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage system settings, users, and data sources
        </p>
      </div>
      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default AdminPage;
