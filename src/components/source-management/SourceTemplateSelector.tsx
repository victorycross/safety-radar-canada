
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SOURCE_TEMPLATES, SourceTemplate } from './sourceTemplates';

interface SourceTemplateSelectorProps {
  onTemplateSelect: (template: SourceTemplate) => void;
}

const SourceTemplateSelector: React.FC<SourceTemplateSelectorProps> = ({ onTemplateSelect }) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Choose Source Type</h3>
        <p className="text-muted-foreground">Select a template to get started quickly</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SOURCE_TEMPLATES.map((template) => {
          const Icon = template.icon;
          return (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-md transition-all hover:border-primary"
              onClick={() => onTemplateSelect(template)}
            >
              <CardHeader className="text-center">
                <Icon className="h-8 w-8 mx-auto mb-2" />
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Badge variant="outline" className="w-full justify-center">
                  {template.defaultConfig.source_type}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SourceTemplateSelector;
