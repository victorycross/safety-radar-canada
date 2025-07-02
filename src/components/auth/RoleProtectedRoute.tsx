
import React from 'react';
import { useAuth, AppRole } from './AuthProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, AlertTriangle } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
  requireAuth?: boolean;
  allowedRoles?: AppRole[];
  fallbackMessage?: string;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requireAuth = true,
  allowedRoles = [],
  fallbackMessage
}) => {
  const { user, userRoles, loading, hasRole } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <Alert>
            <LogIn className="h-4 w-4" />
            <AlertDescription className="mb-4">
              You must be signed in to access this page.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/auth')} className="mt-4">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Check specific role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    const roleNames = {
      admin: 'Administrator',
      power_user: 'Power User',
      regular_user: 'Regular User',
      auditor: 'Auditor'
    };

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              {fallbackMessage || `You need ${roleNames[requiredRole]} privileges to access this page.`}
              <br />
              Your current roles: {userRoles.map(role => roleNames[role]).join(', ') || 'None'}
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/')} variant="outline" className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Check allowed roles (alternative to requiredRole for multiple role support)
  if (allowedRoles.length > 0 && !allowedRoles.some(role => hasRole(role))) {
    const roleNames = {
      admin: 'Administrator',
      power_user: 'Power User',
      regular_user: 'Regular User',
      auditor: 'Auditor'
    };

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {fallbackMessage || `Access restricted. Required roles: ${allowedRoles.map(role => roleNames[role]).join(', ')}`}
              <br />
              Your current roles: {userRoles.map(role => roleNames[role]).join(', ') || 'None'}
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/')} variant="outline" className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
