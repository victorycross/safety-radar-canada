import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserPlus, Shield, Eye, AlertTriangle, CheckCircle, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { format } from 'date-fns';

// Update to match the actual database schema
type DatabaseRole = 'admin' | 'power_user' | 'regular_user';

interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  roles: DatabaseRole[];
  last_sign_in_at?: string;
  has_profile: boolean;
  profile_missing?: boolean;
}

interface UserAudit {
  id: string;
  action_type: string;
  target_user_email: string;
  performed_by: string;
  old_values?: any;
  new_values?: any;
  created_at: string;
}

interface DataIssue {
  type: 'missing_profile' | 'missing_role';
  user_id: string;
  user_email: string;
  description: string;
}

const UserManagementTab = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<UserAudit[]>([]);
  const [dataIssues, setDataIssues] = useState<DataIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<DatabaseRole | 'all'>('all');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [showDataRepair, setShowDataRepair] = useState(false);

  // Create User Form State
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'regular_user' as DatabaseRole
  });

  const roleLabels = {
    admin: 'Administrator',
    power_user: 'Power User',
    regular_user: 'Regular User'
  };

  const roleColors = {
    admin: 'destructive',
    power_user: 'default',
    regular_user: 'secondary'
  } as const;

  useEffect(() => {
    if (isAdmin()) {
      loadUsers();
      loadAuditLogs();
    }
  }, []);

  const logAuditAction = async (actionType: string, targetUserId?: string, targetUserEmail?: string, oldValues?: any, newValues?: any) => {
    try {
      const { error } = await supabase
        .from('user_management_audit')
        .insert({
          action_type: actionType,
          target_user_id: targetUserId,
          target_user_email: targetUserEmail,
          performed_by: (await supabase.auth.getUser()).data.user?.id,
          old_values: oldValues || null,
          new_values: newValues || null
        });

      if (error) {
        console.error('Failed to log audit action:', error);
      }
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  };

  const repairMissingProfiles = async () => {
    setLoading(true);
    try {
      console.log('Starting data repair for missing profiles...');
      
      // Get all auth users
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      // Get existing profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id');
      if (profilesError) throw profilesError;

      const existingProfileIds = new Set(profiles?.map(p => p.id) || []);
      const missingProfiles = authUsers?.filter(user => !existingProfileIds.has(user.id)) || [];

      console.log(`Found ${missingProfiles.length} users without profiles`);

      // Create missing profiles
      if (missingProfiles.length > 0) {
        const profileInserts = missingProfiles.map(user => ({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email
        }));

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileInserts);

        if (insertError) {
          console.error('Error creating profiles:', insertError);
          throw insertError;
        }

        // Assign default roles to users without roles
        const { data: existingRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id');
        if (rolesError) throw rolesError;

        const existingRoleUserIds = new Set(existingRoles?.map(r => r.user_id) || []);
        const usersWithoutRoles = missingProfiles.filter(user => !existingRoleUserIds.has(user.id));

        if (usersWithoutRoles.length > 0) {
          const roleInserts = usersWithoutRoles.map(user => ({
            user_id: user.id,
            role: 'regular_user' as DatabaseRole
          }));

          const { error: roleInsertError } = await supabase
            .from('user_roles')
            .insert(roleInserts);

          if (roleInsertError) {
            console.error('Error creating roles:', roleInsertError);
            throw roleInsertError;
          }
        }

        toast({
          title: 'Data Repair Complete',
          description: `Fixed ${missingProfiles.length} missing profiles and assigned default roles`
        });

        // Log the repair action
        await logAuditAction(
          'data_repair_profiles',
          undefined,
          undefined,
          null,
          { repaired_count: missingProfiles.length, repaired_users: missingProfiles.map(u => u.email) }
        );
      } else {
        toast({
          title: 'No Issues Found',
          description: 'All users have proper profiles and roles'
        });
      }

      // Reload data
      await Promise.all([loadUsers(), loadAuditLogs()]);
    } catch (error: any) {
      console.error('Error during data repair:', error);
      toast({
        title: 'Data Repair Failed',
        description: error.message || 'Failed to repair missing profiles',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    const issues: DataIssue[] = [];
    
    try {
      console.log('Loading users with comprehensive approach...');
      
      // Get all auth users first
      const { data: authUsersResponse, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.error('Error fetching auth users:', authError);
        // Fallback to profiles-only approach
        return loadUsersFromProfiles();
      }

      const authUsers = authUsersResponse?.users || [];
      console.log(`Found ${authUsers.length} auth users`);

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (rolesError) throw rolesError;

      // Create a comprehensive user list
      const usersWithRoles = authUsers.map(authUser => {
        const profile = profiles?.find(p => p.id === authUser.id);
        const roles = userRoles?.filter((ur: any) => ur.user_id === authUser.id).map((ur: any) => ur.role) || [];
        
        // Track data issues
        if (!profile) {
          issues.push({
            type: 'missing_profile',
            user_id: authUser.id,
            user_email: authUser.email || 'Unknown',
            description: 'User exists in auth but missing profile record'
          });
        }
        
        if (roles.length === 0) {
          issues.push({
            type: 'missing_role',
            user_id: authUser.id,
            user_email: authUser.email || 'Unknown',
            description: 'User has no assigned roles'
          });
        }

        return {
          id: authUser.id,
          email: authUser.email || '',
          full_name: profile?.full_name || authUser.user_metadata?.full_name,
          created_at: authUser.created_at,
          roles: roles as DatabaseRole[],
          has_profile: !!profile,
          profile_missing: !profile,
          last_sign_in_at: authUser.last_sign_in_at
        };
      });

      setUsers(usersWithRoles);
      setDataIssues(issues);
      
      console.log(`Loaded ${usersWithRoles.length} users with ${issues.length} data issues`);
      
      if (issues.length > 0) {
        console.warn('Data issues found:', issues);
        setShowDataRepair(true);
      }

    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to the old method
      await loadUsersFromProfiles();
    } finally {
      setLoading(false);
    }
  };

  const loadUsersFromProfiles = async () => {
    try {
      console.log('Falling back to profiles-only loading...');
      
      // Get all profiles with their roles (fallback method)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine the data
      const usersWithRoles = profiles?.map(profile => ({
        id: profile.id,
        email: profile.email || '',
        full_name: profile.full_name,
        created_at: profile.created_at,
        roles: userRoles?.filter((ur: any) => ur.user_id === profile.id).map((ur: any) => ur.role) || [],
        has_profile: true,
        last_sign_in_at: undefined
      })) || [];

      setUsers(usersWithRoles);
      console.log('Loaded users from profiles:', usersWithRoles.length);
    } catch (error) {
      console.error('Error in fallback loading:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    }
  };

  const loadAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('user_management_audit')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setAuditLogs(data || []);
      console.log('Loaded audit logs:', data?.length || 0);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast({
        title: 'Validation Error',
        description: 'Email and password are required',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating user:', newUser.email);
      
      // Create user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.full_name
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (authData.user) {
        console.log('User created in auth:', authData.user.id);
        
        // Wait for trigger to complete profile and role creation
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verify and repair if needed
        await repairUserData(authData.user.id, newUser.email);

        // If the desired role is different from the default 'regular_user', update it
        if (newUser.role !== 'regular_user') {
          console.log('Updating role to:', newUser.role);
          
          const { error: roleUpdateError } = await supabase
            .from('user_roles')
            .update({ role: newUser.role })
            .eq('user_id', authData.user.id)
            .eq('role', 'regular_user');

          if (roleUpdateError) {
            console.error('Role update error:', roleUpdateError);
            toast({
              title: 'Warning',
              description: `User created successfully but role update failed. You can manually update the role later.`,
              variant: 'destructive'
            });
          } else {
            console.log('Role updated successfully');
          }
        }

        // Log the audit action
        await logAuditAction(
          'user_created',
          authData.user.id,
          newUser.email,
          null,
          { 
            role: newUser.role, 
            full_name: newUser.full_name,
            email: newUser.email
          }
        );

        toast({
          title: 'User Created',
          description: `User ${newUser.email} has been created successfully`
        });

        setNewUser({ email: '', full_name: '', password: '', role: 'regular_user' });
        setShowCreateUser(false);
        
        // Reload data
        await Promise.all([loadUsers(), loadAuditLogs()]);
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const repairUserData = async (userId: string, email: string) => {
    try {
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Creating missing profile for user:', userId);
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            full_name: newUser.full_name || email
          });

        if (insertError) {
          console.error('Failed to create profile:', insertError);
        }
      }

      // Check if role exists
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (roleError && roleError.code === 'PGRST116') {
        // Role doesn't exist, create it
        console.log('Creating missing role for user:', userId);
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'regular_user'
          });

        if (insertError) {
          console.error('Failed to create role:', insertError);
        }
      }
    } catch (error) {
      console.error('Error repairing user data:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: DatabaseRole) => {
    setLoading(true);
    try {
      const user = users.find(u => u.id === userId);
      const oldRole = user?.roles[0]; // Assuming single role for now

      console.log('Changing role for user:', userId, 'from', oldRole, 'to', newRole);

      // Update role
      if (oldRole) {
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId)
          .eq('role', oldRole);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: newRole
          });

        if (insertError) throw insertError;
      }

      // Log the audit action
      await logAuditAction(
        'role_changed',
        userId,
        user?.email,
        { role: oldRole },
        { role: newRole }
      );

      toast({
        title: 'Role Updated',
        description: `User role updated to ${roleLabels[newRole]}`
      });

      // Reload data
      await Promise.all([loadUsers(), loadAuditLogs()]);
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.roles.includes(selectedRole as DatabaseRole);
    return matchesSearch && matchesRole;
  });

  const handleRoleFilterChange = (value: string) => {
    setSelectedRole(value as DatabaseRole | 'all');
  };

  if (!isAdmin()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Administrator access required to manage users and roles.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
            <Badge variant="destructive">
              <Shield className="h-3 w-3 mr-1" />
              Admin Only
            </Badge>
          </CardTitle>
          <CardDescription>
            Manage users, assign roles, and view audit logs. All changes are logged for compliance.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Data Issues Alert */}
      {showDataRepair && dataIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Found {dataIssues.length} data integrity issues. Some users may be missing profiles or roles.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={repairMissingProfiles}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Repair Data
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Users & Roles</CardTitle>
                  <CardDescription>
                    Manage user accounts and role assignments ({users.length} users loaded)
                    {dataIssues.length > 0 && (
                      <span className="text-destructive font-medium">
                        {' '}• {dataIssues.length} issues detected
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => Promise.all([loadUsers(), loadAuditLogs()])}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Create User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>
                          Create a new user account and assign their initial role
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="user@example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input
                            id="full_name"
                            value={newUser.full_name}
                            onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Secure password"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Initial Role</Label>
                          <Select 
                            value={newUser.role} 
                            onValueChange={(value: DatabaseRole) => setNewUser(prev => ({ ...prev, role: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="regular_user">Regular User</SelectItem>
                              <SelectItem value="power_user">Power User</SelectItem>
                              <SelectItem value="admin">Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateUser} disabled={loading}>
                            {loading ? 'Creating...' : 'Create User'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search users by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedRole} onValueChange={handleRoleFilterChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="power_user">Power User</SelectItem>
                    <SelectItem value="regular_user">Regular User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.email}</div>
                          {user.full_name && (
                            <div className="text-sm text-muted-foreground">{user.full_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.roles.map((role, index) => (
                            <Badge key={index} variant={roleColors[role]}>
                              {roleLabels[role]}
                            </Badge>
                          ))}
                          {user.roles.length === 0 && (
                            <Badge variant="outline">No Role</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(user.created_at), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.has_profile ? (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Issues
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.roles[0] || ''}
                          onValueChange={(value: DatabaseRole) => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Assign role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regular_user">Regular User</SelectItem>
                            <SelectItem value="power_user">Power User</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredUsers.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found matching your criteria
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                User Management Audit Log
                <Badge variant="outline">{auditLogs.length} entries</Badge>
              </CardTitle>
              <CardDescription>
                Complete audit trail of all user management actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Target User</TableHead>
                    <TableHead>Changes</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{log.action_type}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{log.target_user_email}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {log.old_values && (
                            <div className="text-red-600">
                              From: {JSON.stringify(log.old_values)}
                            </div>
                          )}
                          {log.new_values && (
                            <div className="text-green-600">
                              To: {JSON.stringify(log.new_values)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {auditLogs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No audit logs found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagementTab;
