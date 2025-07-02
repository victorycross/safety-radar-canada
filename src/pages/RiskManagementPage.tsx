import React from 'react';
import SecurityRiskRegisterTab from '@/components/admin/SecurityRiskRegisterTab';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

const RiskManagementPage = () => {
  return (
    <RoleProtectedRoute 
      allowedRoles={['admin', 'power_user']}
      fallbackMessage="Access to Risk Management requires Administrator or Power User privileges."
    >
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Risk Management</h1>
          <p className="text-muted-foreground">
            Security risk register, assessments, and risk mitigation strategies
          </p>
        </div>

        <SecurityRiskRegisterTab />
      </div>
    </RoleProtectedRoute>
  );
};

export default RiskManagementPage;