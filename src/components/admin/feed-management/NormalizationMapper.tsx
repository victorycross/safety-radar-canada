
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Map, AlertTriangle } from 'lucide-react';

interface NormalizationMapperProps {
  sourceType: string;
  normalization: any;
  fieldMapping: any;
  onChange: (normalization: any, fieldMapping: any) => void;
}

const NormalizationMapper: React.FC<NormalizationMapperProps> = ({
  sourceType,
  normalization,
  fieldMapping,
  onChange
}) => {
  const requiredFields = [
    { key: 'titleField', label: 'Title Field', description: 'Maps to UniversalAlert.title', required: true },
    { key: 'descriptionField', label: 'Description Field', description: 'Maps to UniversalAlert.description', required: true },
    { key: 'severityField', label: 'Severity Field', description: 'Maps to UniversalAlert.severity', required: true },
    { key: 'categoryField', label: 'Category Field', description: 'Maps to UniversalAlert.category', required: false },
    { key: 'publishedField', label: 'Published Date Field', description: 'Maps to UniversalAlert.published', required: true },
    { key: 'areaField', label: 'Area Field', description: 'Maps to UniversalAlert.area', required: false },
    { key: 'urgencyField', label: 'Urgency Field', description: 'Maps to UniversalAlert.urgency', required: false },
    { key: 'statusField', label: 'Status Field', description: 'Maps to UniversalAlert.status', required: false },
    { key: 'urlField', label: 'URL Field', description: 'Maps to UniversalAlert.url', required: false },
    { key: 'instructionsField', label: 'Instructions Field', description: 'Maps to UniversalAlert.instructions', required: false }
  ];

  const updateNormalization = (field: string, value: string) => {
    const newNormalization = { ...normalization, [field]: value };
    onChange(newNormalization, fieldMapping);
  };

  const severityMappingExamples = {
    'emergency': 'EXTREME, SEVERE, MODERATE, MINOR',
    'weather': 'Extreme, Severe, Moderate, Minor',
    'security-rss': 'Critical, High, Medium, Low',
    'rss': 'Critical, High, Medium, Low, Info',
    'custom-api': 'Various formats supported',
    'geojson': 'Based on properties schema'
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <Map className="h-5 w-5 mr-2" />
          Field Mapping Configuration
        </h3>
        <p className="text-sm text-muted-foreground">
          Map fields from your source data to the normalized UniversalAlert structure. 
          Use dot notation for nested fields (e.g., "properties.title" or "data.alert.message").
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Universal Alert Structure:</strong> All feeds are normalized to ensure consistent 
          data processing across different sources. Required fields must be mapped for proper functioning.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Field Mappings</CardTitle>
          <CardDescription>
            Specify the source field paths that correspond to each normalized field
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requiredFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.key} className="flex items-center">
                  {field.label}
                  {field.required && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      Required
                    </Badge>
                  )}
                </Label>
              </div>
              <Input
                id={field.key}
                placeholder={`e.g., ${field.key === 'titleField' ? 'title or properties.headline' : 
                  field.key === 'descriptionField' ? 'description or properties.description' :
                  field.key === 'severityField' ? 'severity or properties.severity' :
                  field.key === 'publishedField' ? 'published or properties.sent' :
                  field.key.replace('Field', '')}`}
                value={normalization[field.key] || ''}
                onChange={(e) => updateNormalization(field.key, e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{field.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Severity Value Mapping</CardTitle>
          <CardDescription>
            Understanding how severity values from your source map to normalized levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <strong className="text-sm">Normalized Severity Levels:</strong>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge variant="destructive">Extreme</Badge>
                <Badge variant="destructive">Severe</Badge>
                <Badge variant="secondary">Moderate</Badge>
                <Badge variant="outline">Minor</Badge>
                <Badge variant="outline">Info</Badge>
                <Badge variant="outline">Unknown</Badge>
              </div>
            </div>
            
            {sourceType && severityMappingExamples[sourceType as keyof typeof severityMappingExamples] && (
              <div>
                <strong className="text-sm">Expected {sourceType} Values:</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  {severityMappingExamples[sourceType as keyof typeof severityMappingExamples]}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Advanced Configuration</CardTitle>
          <CardDescription>
            Additional mapping rules and transformation options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Coming Soon:</strong> Advanced features like custom transformation functions, 
              conditional field mapping, and data validation rules will be available in future updates.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default NormalizationMapper;
