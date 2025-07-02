
import React, { useState } from 'react';
import { useAuth, AppRole } from './AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, UserPlus, UserMinus, AlertTriangle } from 'lucide-react';
import { logSecurityEvent, SecurityEvents } from '@/utils/securityAudit';

const SecureRoleManager: React.FC = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('regular_user');
  const [loading, setLoading] = useState(false);

  const assignRole = async () => {
    if (!email || !selectedRole) {
      toast({
        title: 'Validation Error',
        description: 'Please provide both email and role',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Log the role assignment attempt
      await logSecurityEvent({
        action: SecurityEvents.USER_ROLE_CHANGE,
        new_values: { target_email: email, role: selectedRole, action: 'assign' }
      });

      // For admin role, use the existing make_user_admin function
      if (selectedRole === 'admin') {
        const { error } = await supabase.rpc('make_user_admin', {
          _user_email: email
        });
        if (error) throw error;
      } else {
        // For other roles, we need to get the user ID first and insert directly
        // First check if user exists by querying profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();

        if (profileError || !profileData) {
          throw new Error('User not found. Please ensure the user has signed up.');
        }

        // Insert the role - cast to any to work around type issues
        const { error: roleError } = await (supabase as any)
          .from('user_roles')
          .insert({
            user_id: profileData.id,
            role: selectedRole
          });

        if (roleError) {
          // If it's a duplicate role, that's okay
          if (!roleError.message.includes('duplicate')) {
            throw roleError;
          }
        }
      }

      toast({
        title: 'Role Assigned',
        description: `Successfully assigned ${selectedRole} role to ${email}`,
      });

      setEmail('');
      setSelectedRole('regular_user');
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign role',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const removeRole = async () => {
    if (!email || !selectedRole) {
      toast({
        title: 'Validation Error',
        description: 'Please provide both email and role',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Log the role removal attempt
      await logSecurityEvent({
        action: SecurityEvents.USER_ROLE_CHANGE,
        new_values: { target_email: email, role: selectedRole, action: 'remove' }
      });

      // Get user ID from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileError || !profileData) {
        throw new Error('User not found');
      }

      // Remove the role - cast to any to work around type issues
      const { error } = await (supabase as any)
        .from('user_roles')
        .delete()
        .eq('user_id', profileData.id)
        .eq('role', selectedRole);

      if (error) throw error;

      toast({
        title: 'Role Removed',
        description: `Successfully removed ${selectedRole} role from ${email}`,
      });

      setEmail('');
      setSelectedRole('regular_user');
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove role',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin()) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Access denied. Administrator privileges required.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Secure Role Management
        </CardTitle>
        <CardDescription>
          Assign or remove user roles. All actions are logged for security auditing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            User Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium">
            Role
          </label>
          <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular_user">Regular User</SelectItem>
              <SelectItem value="power_user">Power User</SelectItem>
              <SelectItem value="auditor">Auditor</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={assignRole}
            disabled={loading}
            className="flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Role
          </Button>
          <Button
            onClick={removeRole}
            disabled={loading}
            variant="destructive"
            className="flex items-center"
          >
            <UserMinus className="h-4 w-4 mr-2" />
            Remove Role
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecureRoleManager;
