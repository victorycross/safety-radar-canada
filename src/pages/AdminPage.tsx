
import React, { useState } from 'react';
import AdminTabs from '@/components/admin/AdminTabs';
import ExportActions from '@/components/admin/ExportActions';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            System administration, documentation, and configuration management
          </p>
        </div>
        <ExportActions activeTab={activeTab} />
      </div>

      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default AdminPage;
