
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DiagnosticResult } from '../types';
import { getCategoryIcon } from '../utils/diagnosticUtils';
import DiagnosticResultCard from './DiagnosticResultCard';

interface DiagnosticCategoryCardProps {
  category: string;
  results: DiagnosticResult[];
}

const DiagnosticCategoryCard: React.FC<DiagnosticCategoryCardProps> = ({ category, results }) => {
  const CategoryIcon = getCategoryIcon(category);
  const passedCount = results.filter(r => r.status === 'pass').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 capitalize">
          <CategoryIcon className="h-4 w-4" />
          {category} Diagnostics
        </CardTitle>
        <CardDescription>
          {passedCount}/{results.length} checks passed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.map((result, index) => (
            <DiagnosticResultCard key={index} result={result} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosticCategoryCard;
