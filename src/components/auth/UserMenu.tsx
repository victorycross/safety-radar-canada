
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from './AuthProvider';
import { User, LogOut, Settings, Shield } from 'lucide-react';

const UserMenu = () => {
  const { user, userRoles, signOut, isAdmin, isPowerUserOrAdmin } = useAuth();

  if (!user) {
    return null;
  }

  const roleColors = {
    admin: 'bg-red-100 text-red-800',
    power_user: 'bg-blue-100 text-blue-800',
    regular_user: 'bg-green-100 text-green-800'
  };

  const roleNames = {
    admin: 'Admin',
    power_user: 'Power User',
    regular_user: 'User'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden md:inline">{user.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.email}</p>
            <div className="flex flex-wrap gap-1">
              {userRoles.map(role => (
                <Badge 
                  key={role} 
                  variant="secondary" 
                  className={`text-xs ${roleColors[role]}`}
                >
                  {roleNames[role]}
                </Badge>
              ))}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isPowerUserOrAdmin() && (
          <>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Management</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {isAdmin() && (
          <>
            <DropdownMenuItem>
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Panel</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={signOut} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
