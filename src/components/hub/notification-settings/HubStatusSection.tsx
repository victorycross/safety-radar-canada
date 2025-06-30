
import React from 'react';
import { InternationalHub } from '@/types/dashboard';

interface HubStatusSectionProps {
  hub: InternationalHub;
}

const HubStatusSection: React.FC<HubStatusSectionProps> = ({ hub }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium mb-2">Current Hub Status</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Alert Level:</span>
          <p className="font-medium">{hub.alertLevel}</p>
        </div>
        <div>
          <span className="text-gray-600">Employees:</span>
          <p className="font-medium">{hub.employeeCount}</p>
        </div>
        <div>
          <span className="text-gray-600">Incidents:</span>
          <p className="font-medium">{hub.localIncidents}</p>
        </div>
        <div>
          <span className="text-gray-600">Status:</span>
          <p className="font-medium">{hub.isActive ? 'Active' : 'Inactive'}</p>
        </div>
      </div>
    </div>
  );
};

export default HubStatusSection;
