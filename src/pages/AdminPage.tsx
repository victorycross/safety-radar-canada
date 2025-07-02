
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';

const AdminPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to operations page by default
    navigate('/admin/operations', { replace: true });
  }, [navigate]);

  return (
    <RoleProtectedRoute 
      allowedRoles={['admin', 'power_user']}
      fallbackMessage="Access to the Admin Dashboard requires Administrator or Power User privileges."
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Redirecting to Operations...</h2>
            <p className="text-muted-foreground">Please wait while we redirect you to the admin operations page.</p>
          </div>
        </div>
      </div>
    </RoleProtectedRoute>
  );
};

export default AdminPage;
