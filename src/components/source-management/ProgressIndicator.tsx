
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
        currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
      }`}>
        {currentStep > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
      </div>
      <div className={`h-0.5 w-16 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
        currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
      }`}>
        {currentStep > 2 ? <CheckCircle className="h-4 w-4" /> : '2'}
      </div>
      <div className={`h-0.5 w-16 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
        currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'
      }`}>
        3
      </div>
    </div>
  );
};

export default ProgressIndicator;
