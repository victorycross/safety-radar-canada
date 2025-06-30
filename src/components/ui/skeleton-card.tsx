
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonCardProps {
  showHeader?: boolean;
  headerLines?: number;
  contentLines?: number;
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showHeader = true,
  headerLines = 2,
  contentLines = 3,
  className = ""
}) => {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          {Array.from({ length: headerLines }).map((_, i) => (
            <Skeleton 
              key={i} 
              className={`h-4 ${i === 0 ? 'w-3/4' : 'w-1/2'}`} 
            />
          ))}
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: contentLines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={`h-4 ${
              i === contentLines - 1 ? 'w-2/3' : 'w-full'
            }`} 
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default SkeletonCard;
