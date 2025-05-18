
import React from 'react';

const MapLegend = () => {
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
      <div className="flex items-center gap-2 mt-1">
        <div className="w-4 h-4 rounded-full bg-white border border-slate-700 flex items-center justify-center text-[10px]">5</div>
        <span>Incident Count</span>
      </div>
    </div>
  );
};

export default MapLegend;
