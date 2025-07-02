
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
import { Users, UserPlus, Shield, Eye, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { format } from 'date-fns';

type AppRole = 'admin' | 'power_user' | 'regular_user' | 'auditor';

interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  roles: AppRole[];
  last_sign_in_at?: string;
}

interface UserAudit {
  id: string;
  action: string;
  target_user_email: string;
  performed_by: string;
  old_values?: any;
  new_values?: any;
  created_at: string;
}

const UserManagementTab = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<UserAudit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole | 'all'>('all');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  // Create User Form State
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'regular_user' as AppRole
  });

  const roleLabels = {
    admin: 'Administrator',
    power_user: 'Power User',
    regular_user: 'Regular User',
    auditor: 'Auditor'
  };

  const roleColors = {
    admin: 'destructive',
    power_user: 'default',
    regular_user: 'secondary',
    auditor: 'outline'
  } as const;

  useEffect(() => {
    if (isAdmin()) {
      loadUsers();
      loadAuditLogs();
    }
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Get all profiles with their roles
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
        roles: userRoles?.filter(ur => ur.user_id === profile.id).map(ur => ur.role) || [],
        last_sign_in_at: undefined // Would need to get from auth.users if accessible
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
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
      // Create user via Supabase Auth Admin API (would need service role key)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.full_name
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Assign role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: newUser.role
          });

        if (roleError) throw roleError;

        // Log the action
        await supabase.rpc('log_user_management_action', {
          action_type: 'user_created',
          target_user_id: authData.user.id,
          target_user_email: newUser.email,
          new_values: { role: newUser.role, full_name: newUser.full_name }
        });

        toast({
          title: 'User Created',
          description: `User ${newUser.email} has been created successfully`
        });

        setNewUser({ email: '', full_name: '', password: '', role: 'regular_user' });
        setShowCreateUser(false);
        loadUsers();
        loadAuditLogs();
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

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    setLoading(true);
    try {
      const user = users.find(u => u.id === userId);
      const oldRole = user?.roles[0]; // Assuming single role for now

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

      toast({
        title: 'Role Updated',
        description: `User role updated to ${roleLabels[newRole]}`
      });

      loadUsers();
      loadAuditLogs();
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
    const matchesRole = selectedRole === 'all' || user.roles.includes(selectedRole as AppRole);
    return matchesSearch && matchesRole;
  });

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
                    Manage user accounts and role assignments
                  </CardDescription>
                </div>
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
                          onValueChange={(value: AppRole) => setNewUser(prev => ({ ...prev, role: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regular_user">Regular User</SelectItem>
                            <SelectItem value="power_user">Power User</SelectItem>
                            <SelectItem value="auditor">Auditor</SelectItem>
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
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="power_user">Power User</SelectItem>
                    <SelectItem value="auditor">Auditor</SelectItem>
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
                        <Select
                          value={user.roles[0] || ''}
                          onValueChange={(value: AppRole) => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Assign role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regular_user">Regular User</SelectItem>
                            <SelectItem value="power_user">Power User</SelectItem>
                            <SelectItem value="auditor">Auditor</SelectItem>
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
                          <Badge variant="outline">{log.action}</Badge>
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
