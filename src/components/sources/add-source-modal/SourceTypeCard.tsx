
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SourceType {
  id: string;
  name: string;
  description: string;
  icon: any;
  defaultConfig: {
    method: string;
    pollInterval: number;
    timeout: number;
  };
}

interface SourceTypeCardProps {
  sourceType: SourceType;
  isSelected: boolean;
  onSelect: (typeId: string) => void;
}

const SourceTypeCard: React.FC<SourceTypeCardProps> = ({
  sourceType,
  isSelected,
  onSelect
}) => {
  const Icon = sourceType.icon;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(sourceType.id)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {sourceType.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-xs">
          {sourceType.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default SourceTypeCard;
