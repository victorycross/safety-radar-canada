import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import StaffReportReviewsTab from '@/components/admin/StaffReportReviewsTab';
import SecurityRiskRegisterTab from '@/components/admin/SecurityRiskRegisterTab';
import { Shield } from 'lucide-react';

const AdminSecurityPage = () => {
  return (
    <RoleProtectedRoute 
      allowedRoles={['admin', 'power_user']}
      fallbackMessage="Access to Security Team requires Administrator or Power User privileges."
    >
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Security Team Operations
          </h1>
          <p className="text-muted-foreground mt-2">
            Centralized security operations center for threat management, incident review, and risk assessment
          </p>
        </div>

        <Tabs defaultValue="staff-reports" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="staff-reports">Staff Report Reviews</TabsTrigger>
            <TabsTrigger value="risk-register">Security Risk Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="staff-reports" className="space-y-4 mt-6">
            <StaffReportReviewsTab />
          </TabsContent>
          
          <TabsContent value="risk-register" className="space-y-4 mt-6">
            <SecurityRiskRegisterTab />
          </TabsContent>
        </Tabs>
      </div>
    </RoleProtectedRoute>
  );
};

export default AdminSecurityPage;