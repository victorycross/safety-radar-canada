
import React from 'react';
import { Link } from 'react-router-dom';
import { Circle } from 'lucide-react';
import { AlertLevel } from '@/types';
import { getAlertColor, getAlertBadge } from './utils';
import { provinceEmojis } from './data';

interface Province {
  id: string;
  name: string;
  code: string;
  alertLevel: AlertLevel;
  employeeCount: number;
}

interface ProvinceCardProps {
  province: Province;
}

const ProvinceCard = ({ province }: ProvinceCardProps) => {
  const emoji = provinceEmojis[province.id as keyof typeof provinceEmojis];
  
  return (
    <Link key={province.id} to={`/province/${province.id}`}>
      <div 
        className={`
          ${getAlertColor(province.alertLevel)} 
          rounded-lg p-4 transition-all duration-300 ease-in-out 
          hover:scale-105 hover:shadow-lg cursor-pointer
          flex flex-col items-center justify-center space-y-3
          min-h-[200px] group
        `}
        title={`${province.name} - ${province.employeeCount.toLocaleString()} employees`}
      >
        {/* Flag/Emoji */}
        <div className="text-3xl mb-2">{emoji}</div>
        
        {/* Circle Icon */}
        <Circle 
          size={48} 
          className="text-white/80 group-hover:text-white transition-colors duration-200 stroke-2"
        />
        
        {/* Location Name */}
        <div className="text-center">
          <div className="text-white font-bold text-lg">
            {province.name}
          </div>
          <div className="text-white/90 text-sm">
            {province.code.toUpperCase()}
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="text-white font-semibold text-lg">
          {getAlertBadge(province.alertLevel)}
        </div>
        
        {/* Stats */}
        <div className="text-white/90 text-sm text-center space-y-1">
          <div>0 warnings</div>
          <div>{province.employeeCount.toLocaleString()} employees</div>
        </div>
      </div>
    </Link>
  );
};

export default ProvinceCard;
