
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Cloud, Shield, Rss, Globe, MapPin } from 'lucide-react';

interface FeedTemplate {
  id: string;
  name: string;
  sourceType: string;
  description: string;
  icon: React.ReactNode;
  complexity: 'Simple' | 'Moderate' | 'Advanced';
  apiEndpoint?: string;
  configuration: any;
  normalization: any;
  fieldMapping?: any;
}

const feedTemplates: FeedTemplate[] = [
  {
    id: 'emergency-cap',
    name: 'Emergency CAP Feed',
    sourceType: 'emergency',
    description: 'Common Alerting Protocol (CAP) emergency alerts with standard XML structure',
    icon: <AlertTriangle className="h-5 w-5" />,
    complexity: 'Simple',
    configuration: {
      timeout: 30,
      retries: 3,
      headers: { 'Accept': 'application/xml' }
    },
    normalization: {
      titleField: 'headline',
      descriptionField: 'description',
      severityField: 'severity',
      categoryField: 'category',
      publishedField: 'sent',
      areaField: 'areaDesc'
    },
    fieldMapping: {
      'cap:alert.cap:info.cap:headline': 'title',
      'cap:alert.cap:info.cap:description': 'description',
      'cap:alert.cap:info.cap:severity': 'severity',
      'cap:alert.cap:info.cap:category': 'category'
    }
  },
  {
    id: 'weather-geocmet',
    name: 'Environment Canada GeoMet',
    sourceType: 'weather',
    description: 'Environment Canada weather alerts via GeoMet OGC API in GeoJSON format',
    icon: <Cloud className="h-5 w-5" />,
    complexity: 'Moderate',
    apiEndpoint: 'https://geo.weather.gc.ca/geomet/features/collections/weather-alerts/items',
    configuration: {
      timeout: 60,
      retries: 2,
      headers: { 'Accept': 'application/geo+json' }
    },
    normalization: {
      titleField: 'properties.headline',
      descriptionField: 'properties.description',
      severityField: 'properties.severity',
      categoryField: 'properties.event',
      publishedField: 'properties.effective',
      areaField: 'properties.area'
    }
  },
  {
    id: 'security-rss',
    name: 'Security RSS Feed',
    sourceType: 'security-rss',
    description: 'RSS feeds for cybersecurity alerts and advisories',
    icon: <Shield className="h-5 w-5" />,
    complexity: 'Simple',
    configuration: {
      timeout: 30,
      retries: 3,
      headers: { 'Accept': 'application/rss+xml, application/xml' }
    },
    normalization: {
      titleField: 'title',
      descriptionField: 'description',
      severityField: 'category',
      categoryField: 'category',
      publishedField: 'pubDate',
      areaField: 'location'
    }
  },
  {
    id: 'generic-rss',
    name: 'Generic RSS Feed',
    sourceType: 'rss',
    description: 'Standard RSS 2.0 feeds with basic alert information',
    icon: <Rss className="h-5 w-5" />,
    complexity: 'Simple',
    configuration: {
      timeout: 30,
      retries: 3,
      headers: { 'Accept': 'application/rss+xml' }
    },
    normalization: {
      titleField: 'title',
      descriptionField: 'description',
      severityField: 'severity',
      categoryField: 'category',
      publishedField: 'pubDate',
      areaField: 'location'
    }
  },
  {
    id: 'custom-api',
    name: 'Custom JSON API',
    sourceType: 'custom-api',
    description: 'Custom JSON API endpoints with configurable field mapping',
    icon: <Globe className="h-5 w-5" />,
    complexity: 'Advanced',
    configuration: {
      timeout: 30,
      retries: 3,
      headers: { 'Accept': 'application/json' }
    },
    normalization: {
      titleField: 'title',
      descriptionField: 'message',
      severityField: 'level',
      categoryField: 'type',
      publishedField: 'timestamp',
      areaField: 'region'
    }
  },
  {
    id: 'geojson-api',
    name: 'GeoJSON Features API',
    sourceType: 'geojson',
    description: 'GeoJSON feature collections with geographic alert data',
    icon: <MapPin className="h-5 w-5" />,
    complexity: 'Moderate',
    configuration: {
      timeout: 45,
      retries: 2,
      headers: { 'Accept': 'application/geo+json' }
    },
    normalization: {
      titleField: 'properties.name',
      descriptionField: 'properties.description',
      severityField: 'properties.severity',
      categoryField: 'properties.category',
      publishedField: 'properties.timestamp',
      areaField: 'properties.area'
    }
  }
];

interface FeedTemplateSelectorProps {
  selectedType: string;
  onTemplateSelect: (template: FeedTemplate) => void;
}

const FeedTemplateSelector: React.FC<FeedTemplateSelectorProps> = ({ 
  selectedType, 
  onTemplateSelect 
}) => {
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTemplates = selectedType 
    ? feedTemplates.filter(t => t.sourceType === selectedType)
    : feedTemplates;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose a Template</h3>
        <p className="text-sm text-muted-foreground">
          Select a pre-configured template that matches your data source format. 
          Templates include optimized field mappings and normalization rules.
        </p>
      </div>

      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Templates Available</h3>
            <p className="text-muted-foreground text-center">
              No pre-configured templates are available for the selected source type. 
              You can continue with custom configuration in the Field Mapping tab.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {template.icon}
                    <CardTitle className="text-base">{template.name}</CardTitle>
                  </div>
                  <Badge className={getComplexityColor(template.complexity)}>
                    {template.complexity}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    <strong>Field Mappings:</strong>
                  </div>
                  <div className="text-xs space-y-1">
                    <div>Title: <code className="bg-muted px-1 rounded">{template.normalization.titleField}</code></div>
                    <div>Description: <code className="bg-muted px-1 rounded">{template.normalization.descriptionField}</code></div>
                    <div>Severity: <code className="bg-muted px-1 rounded">{template.normalization.severityField}</code></div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => onTemplateSelect(template)}
                  >
                    Use This Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedTemplateSelector;
