
import React from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';

const MapLegend = () => {
  const { incidents } = useSupabaseDataContext();
  
  // Calculate total active incidents (non-archived)
  const activeIncidentCount = incidents.filter(incident => !incident.archived_at).length;

  return (
    <div className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-md shadow-sm text-xs">
      <div className="font-medium mb-1">Alert Level</div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-danger"></div>
        <span>Severe</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-warning"></div>
        <span>Warning</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-success"></div>
        <span>Normal</span>
      </div>
      {activeIncidentCount > 0 && (
        <div className="flex items-center gap-2 mt-1">
          <div className="w-4 h-4 rounded-full bg-white border border-slate-700 flex items-center justify-center text-[10px]">
            {activeIncidentCount}
          </div>
          <span>Active Incidents</span>
        </div>
      )}
      <div className="mt-2 pt-2 border-t border-slate-200">
        <Link to="/alert-ready" className="text-primary text-[10px] flex items-center">
          <Bell className="w-2 h-2 mr-1" />
          View BC Alerts
        </Link>
      </div>
    </div>
  );
};

export default MapLegend;
