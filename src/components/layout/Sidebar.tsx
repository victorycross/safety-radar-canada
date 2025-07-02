
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
  Database,
  Archive,
  MonitorSpeaker,
  Cog,
  ChevronDown,
  ChevronRight,
  PieChart,
  Target,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const Sidebar = () => {
  const location = useLocation();
  const { user, isAdmin, isPowerUserOrAdmin, hasRole } = useAuth();
  const [adminExpanded, setAdminExpanded] = useState(
    location.pathname.startsWith('/admin')
  );

  // Dashboard & Monitoring section - for all authenticated users
  const dashboardSection = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Alert Ready', href: '/alert-ready', icon: AlertTriangle },
    { name: 'Location Status', href: '/location-status', icon: MapPin },
  ];

  // Analytics & Strategic Reporting section - for admins, power users, and auditors
  const analyticsSection = (isAdmin() || isPowerUserOrAdmin() || hasRole('auditor')) ? [
    { name: 'Analytics Dashboard', href: '/analytics-dashboard', icon: BarChart3 },
    { name: 'Risk Management', href: '/risk-management', icon: Target },
    { name: 'Executive Reports', href: '/executive-reports', icon: TrendingUp },
    { name: 'Reporting Tools', href: '/reporting-tools', icon: Download },
  ] : [];

  // Incident Management section - for all authenticated users
  const incidentSection = [
    { name: 'Incident Reports', href: '/incidents', icon: Activity },
    { name: 'Report Incident', href: '/report-incident', icon: FileText },
  ];


  // Admin subsections - for administrators only
  const adminSubsections = isAdmin() ? [
    { name: 'Operations', href: '/admin/operations', icon: Cog },
    { name: 'Data Management', href: '/admin/data-management', icon: Database },
    { name: 'System Health', href: '/admin/system-health', icon: MonitorSpeaker },
    { name: 'Archive Management', href: '/admin/archive-management', icon: Archive },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Settings & Documentation', href: '/admin/settings', icon: Settings },
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
               location.search.includes(item.href.split('?')[1]));
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

  const renderAdminSection = () => {
    if (!isAdmin() || adminSubsections.length === 0) {
      return null;
    }

    return (
      <div className="mb-6">
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Administration
        </h3>
        <div>
          <button
            onClick={() => setAdminExpanded(!adminExpanded)}
            className={cn(
              'flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors',
              'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <Shield className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="flex-1 text-left">Administration</span>
            {adminExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          {adminExpanded && (
            <ul className="ml-8 mt-1 space-y-1">
              {adminSubsections.map((item) => {
                const isActive = location.pathname === item.href;
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
                      <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
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
        {renderNavigationSection('Analytics & Strategic Reporting', analyticsSection)}
        {renderNavigationSection('Incident Management', incidentSection)}
        {renderAdminSection()}
      </nav>
    </div>
  );
};

export default Sidebar;
