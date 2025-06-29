
import React from 'react';
import { useAuth, AppRole } from './AuthProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requireAuth = true 
}) => {
  const { user, userRoles, loading, hasRole } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <Alert>
            <LogIn className="h-4 w-4" />
            <AlertDescription className="mb-4">
              You need to be signed in to access this page.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/auth')} className="mt-4">
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    const roleNames = {
      admin: 'Administrator',
      power_user: 'Power User',
      regular_user: 'Regular User'
    };

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              You need {roleNames[requiredRole]} privileges to access this page.
              Your current roles: {userRoles.map(role => roleNames[role]).join(', ') || 'None'}
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/')} variant="outline" className="mt-4">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
