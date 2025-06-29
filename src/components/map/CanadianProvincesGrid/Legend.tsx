
import React from 'react';

const Legend = () => {
  return (
    <div className="flex items-center justify-center space-x-6 pt-4 border-t">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-success"></div>
        <span className="text-sm">Safe</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-warning"></div>
        <span className="text-sm">Caution</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-danger"></div>
        <span className="text-sm">High Risk</span>
      </div>
    </div>
  );
};

export default Legend;
