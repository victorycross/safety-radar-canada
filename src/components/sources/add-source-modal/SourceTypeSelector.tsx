
import React from 'react';
import { Label } from "@/components/ui/label";
import SourceTypeCard from './SourceTypeCard';
import { SOURCE_TYPES } from './sourceTypes';

interface SourceTypeSelectorProps {
  selectedType: string;
  onTypeSelect: (typeId: string) => void;
}

const SourceTypeSelector: React.FC<SourceTypeSelectorProps> = ({
  selectedType,
  onTypeSelect
}) => {
  return (
    <div>
      <Label className="text-base font-medium">Source Type</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
        {SOURCE_TYPES.map((type) => (
          <SourceTypeCard
            key={type.id}
            sourceType={type}
            isSelected={selectedType === type.id}
            onSelect={onTypeSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default SourceTypeSelector;
