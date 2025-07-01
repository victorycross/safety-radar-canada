
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Home,
  Shield,
  Activity,
  BarChart3,
  AlertTriangle,
  FileText,
  Users,
  MapPin,
  Settings,
  TrendingUp,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  const { user, isAdmin, isPowerUserOrAdmin } = useAuth();

  // Dashboard & Monitoring section - for all authenticated users
  const dashboardSection = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Alert Ready', href: '/alert-ready', icon: AlertTriangle },
    { name: 'Location Status', href: '/location-status', icon: MapPin },
  ];

  // Analytics & Reporting section - for admins only
  const analyticsSection = isAdmin() ? [
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Incident Reports', href: '/incidents', icon: Activity },
    { name: 'Executive Reports', href: '/report', icon: TrendingUp },
  ] : [];

  // Input & Reporting section - different items based on role
  const inputSection = [
    { name: 'Report Incident', href: '/report-incident', icon: FileText },
    // Data Management - for power users and admins
    ...(isPowerUserOrAdmin() ? [
      { 
        name: 'Data Management', 
        href: isAdmin() ? '/admin?tab=data-management' : '/data-management', 
        icon: Database 
      },
    ] : [])
  ];

  // Admin section - for administrators only
  const adminSection = isAdmin() ? [
    { name: 'Admin', href: '/admin', icon: Shield },
  ] : [];

  if (!user) {
    return null;
  }

  const renderNavigationSection = (title: string, items: typeof dashboardSection) => {
    // Don't render empty sections
    if (items.length === 0) {
      return null;
    }

    return (
      <div className="mb-6">
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {title}
        </h3>
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href.includes('?tab=') && location.pathname === item.href.split('?')[0] && 
               location.search.includes(item.href.split('?')[1])) ||
              (item.href === '/data-management' && location.pathname === '/data-management');
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="font-bold text-lg">Security Barometer</h1>
            <p className="text-sm text-gray-600">Canadian Operations</p>
          </div>
        </div>
      </div>
      
      <nav className="px-3 pb-6">
        {renderNavigationSection('Dashboard & Monitoring', dashboardSection)}
        {renderNavigationSection('Analytics & Reporting', analyticsSection)}
        {renderNavigationSection('Input & Reporting', inputSection)}
        {renderNavigationSection('Administration', adminSection)}
      </nav>
    </div>
  );
};

export default Sidebar;
