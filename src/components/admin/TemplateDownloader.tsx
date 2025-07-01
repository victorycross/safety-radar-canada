
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Database } from 'lucide-react';

const TemplateDownloader = () => {
  const templateCategories = [
    {
      name: 'Province Data',
      description: 'Update province employee counts and alert levels',
      filename: 'province-data-template.csv',
      headers: ['name', 'code', 'alert_level', 'employee_count'],
      sampleData: [
        ['Ontario', 'ON', 'normal', '2500'],
        ['Quebec', 'QC', 'warning', '1800'],
        ['British Columbia', 'BC', 'normal', '1200']
      ],
      validation: [
        'code: 2-letter province code (ON, QC, BC, etc.)',
        'alert_level: normal | warning | severe',
        'employee_count: 0-50000'
      ]
    },
    {
      name: 'International Hubs',
      description: 'Manage international office locations',
      filename: 'international-hubs-template.csv',
      headers: ['name', 'country', 'code', 'employee_count', 'alert_level', 'is_active'],
      sampleData: [
        ['New York Office', 'United States', 'US-NYC', '150', 'normal', 'true'],
        ['London Office', 'United Kingdom', 'UK-LON', '100', 'normal', 'true'],
        ['Paris Office', 'France', 'FR-PAR', '75', 'warning', 'true']
      ],
      validation: [
        'employee_count: 0-1000',
        'alert_level: normal | warning | severe',
        'is_active: true | false'
      ]
    },
    {
      name: 'Employee Locations',
      description: 'Bulk update employee distribution across cities',
      filename: 'employee-locations-template.csv',
      headers: ['province_code', 'city_name', 'home_base_count', 'current_location_count', 'travel_away_count'],
      sampleData: [
        ['ON', 'Toronto', '100', '95', '5'],
        ['QC', 'Montreal', '75', '70', '5'],
        ['BC', 'Vancouver', '60', '58', '2']
      ],
      validation: [
        'province_code: 2-letter code matching existing provinces',
        'All counts: >= 0',
        'city_name: Must match existing city records'
      ]
    },
    {
      name: 'Security Alerts',
      description: 'Import security alert data',
      filename: 'security-alerts-template.csv',
      headers: ['id', 'title', 'category', 'location', 'source'],
      sampleData: [
        ['SA-2024-001', 'Critical Vulnerability Alert', 'cybersecurity', 'Global', 'CSE'],
        ['SA-2024-002', 'Physical Security Update', 'physical_security', 'Ottawa', 'RCMP'],
        ['SA-2024-003', 'Intelligence Briefing', 'intelligence', 'Canada', 'CSIS']
      ],
      validation: [
        'id: Required unique identifier',
        'category: cybersecurity | physical_security | intelligence | other',
        'source: Never "test" or empty'
      ]
    },
    {
      name: 'Weather Alerts',
      description: 'Import weather-related emergency alerts',
      filename: 'weather-alerts-template.csv',
      headers: ['id', 'event_type', 'severity', 'description', 'onset', 'expires'],
      sampleData: [
        ['WA-2024-001', 'Severe Thunderstorm', 'severe', 'Heavy rain and winds expected', '2024-07-01T14:00:00Z', '2024-07-01T20:00:00Z'],
        ['WA-2024-002', 'Blizzard Warning', 'extreme', 'Significant snowfall and high winds', '2024-12-15T06:00:00Z', '2024-12-16T18:00:00Z']
      ],
      validation: [
        'id: Required unique identifier',
        'severity: minor | moderate | severe | extreme',
        'onset/expires: ISO date format (YYYY-MM-DDTHH:mm:ssZ)'
      ]
    },
    {
      name: 'Travel Records',
      description: 'Employee travel tracking data',
      filename: 'travel-records-template.csv',
      headers: ['employee_id', 'home_city_id', 'current_city_id', 'travel_status', 'departure_date', 'return_date'],
      sampleData: [
        ['EMP-12345', 'toronto-on', 'vancouver-bc', 'traveling', '2024-07-01T09:00:00Z', '2024-07-05T17:00:00Z'],
        ['EMP-67890', 'montreal-qc', 'ottawa-on', 'away', '2024-06-28T14:00:00Z', '2024-07-02T16:00:00Z']
      ],
      validation: [
        'employee_id: Never TEST% or EMP00%',
        'travel_status: home | traveling | away',
        'travel_platform: Never "test" or "manual"'
      ]
    }
  ];

  const downloadTemplate = (category: typeof templateCategories[0]) => {
    const csvContent = [
      category.headers.join(','),
      ...category.sampleData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = category.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllTemplates = () => {
    const allTemplatesContent = templateCategories.map(category => {
      const section = [
        `# ${category.name.toUpperCase()} TEMPLATE`,
        `# ${category.description}`,
        `# Filename: ${category.filename}`,
        '',
        '# Validation Rules:',
        ...category.validation.map(rule => `# - ${rule}`),
        '',
        category.headers.join(','),
        ...category.sampleData.map(row => row.join(',')),
        '',
        '=' .repeat(50),
        ''
      ].join('\n');
      return section;
    }).join('\n');

    const blob = new Blob([allTemplatesContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-data-templates.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Templates & Downloads</h2>
          <p className="text-muted-foreground">
            Download CSV templates for bulk data import with validation examples
          </p>
        </div>
        <Button onClick={downloadAllTemplates} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download All Templates
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templateCategories.map((category, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {category.name}
              </CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Template Headers:</h4>
                <div className="flex flex-wrap gap-1">
                  {category.headers.map(header => (
                    <Badge key={header} variant="secondary" className="text-xs">
                      {header}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Validation Rules:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {category.validation.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span>•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                onClick={() => downloadTemplate(category)} 
                className="w-full"
                variant="outline"
              >
                <FileText className="mr-2 h-4 w-4" />
                Download {category.name} Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Import Guidelines</CardTitle>
          <CardDescription>Important considerations for batch data operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">File Format Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• CSV format with UTF-8 encoding</li>
                <li>• Headers must match template exactly</li>
                <li>• No empty rows or columns</li>
                <li>• Maximum 1000 records per file</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Data Quality Standards</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• All required fields must be populated</li>
                <li>• Foreign key references must exist</li>
                <li>• No test data (avoid "test", "dummy", etc.)</li>
                <li>• Validate date formats (ISO 8601)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateDownloader;
