
import React from 'react';
import { AlertLevel } from '@/types';
import { NavLink } from 'react-router-dom';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle,
  Bell,
  Flag,
  Info,
  MapPin,
  Search,
  Users
} from 'lucide-react';

const Sidebar = () => {
  const { provinces } = useSupabaseDataContext();
  
  // Count provinces by alert level
  const severeCount = provinces.filter(p => p.alertLevel === AlertLevel.SEVERE).length;
  const warningCount = provinces.filter(p => p.alertLevel === AlertLevel.WARNING).length;

  return (
    <div className="h-screen w-64 bg-sidebar border-r flex flex-col">
      <div className="p-6">
        <h1 className="font-bold text-xl text-primary flex items-center">
          <AlertTriangle className="mr-2 text-red-500" size={20} />
          Security Barometer
        </h1>
      </div>
      
      <div className="p-4 bg-warning-light border-y border-warning/20">
        <div className="flex justify-between items-center">
          <div className="font-medium text-sm">Alert Summary</div>
        </div>
        <div className="mt-2 space-y-1 text-sm">
          {severeCount > 0 && (
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-danger mr-2"></div>
              <span>{severeCount} {severeCount === 1 ? 'Severe Alert' : 'Severe Alerts'}</span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-warning mr-2"></div>
              <span>{warningCount} {warningCount === 1 ? 'Warning Alert' : 'Warning Alerts'}</span>
            </div>
          )}
          {severeCount === 0 && warningCount === 0 && (
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-success mr-2"></div>
              <span>All Clear</span>
            </div>
          )}
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Dashboard</p>
        
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            cn("flex items-center px-3 py-2 rounded-md text-sm", 
              isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
        >
          <MapPin className="mr-2" size={18} />
          Map Overview
        </NavLink>
        
        <NavLink 
          to="/incidents" 
          className={({ isActive }) => 
            cn("flex items-center px-3 py-2 rounded-md text-sm", 
              isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
        >
          <AlertTriangle className="mr-2" size={18} />
          Incident Reports
        </NavLink>
        
        <NavLink 
          to="/report" 
          className={({ isActive }) => 
            cn("flex items-center px-3 py-2 rounded-md text-sm", 
              isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
        >
          <Flag className="mr-2" size={18} />
          Report Incident
        </NavLink>
        
        <NavLink 
          to="/sources" 
          className={({ isActive }) => 
            cn("flex items-center px-3 py-2 rounded-md text-sm", 
              isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
        >
          <Bell className="mr-2" size={18} />
          External Sources
        </NavLink>
        
        <NavLink 
          to="/analytics" 
          className={({ isActive }) => 
            cn("flex items-center px-3 py-2 rounded-md text-sm", 
              isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
        >
          <Search className="mr-2" size={18} />
          Analytics
        </NavLink>
        
        <p className="text-xs uppercase tracking-wider text-muted-foreground mt-6 mb-2">Configuration</p>
        
        <NavLink 
          to="/employees" 
          className={({ isActive }) => 
            cn("flex items-center px-3 py-2 rounded-md text-sm", 
              isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
        >
          <Users className="mr-2" size={18} />
          Employee Distribution
        </NavLink>
        
        <NavLink 
          to="/widget" 
          className={({ isActive }) => 
            cn("flex items-center px-3 py-2 rounded-md text-sm", 
              isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
        >
          <Info className="mr-2" size={18} />
          Desktop Widget
        </NavLink>
      </nav>
      
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          Security Barometer v1.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
