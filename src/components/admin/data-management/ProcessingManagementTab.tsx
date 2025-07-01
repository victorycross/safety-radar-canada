
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Zap, 
  Shield, 
  Target, 
  CheckCircle,
  AlertTriangle,
  Database,
  Filter
} from 'lucide-react';

const ProcessingManagementTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Data Processing Management</h3>
        <p className="text-muted-foreground">
          Configure normalization, classification, and analysis rules for incoming data
        </p>
      </div>

      {/* Data Normalization Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Normalization Settings
          </CardTitle>
          <CardDescription>
            Field mapping, format conversion, and data standardization rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Field Mapping Rules</span>
                <Badge variant="default">18 Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Date Format Conversion</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Location Standardization</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Text Cleaning Rules</span>
                <Badge variant="default">12 Rules</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Button className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Configure Mapping
              </Button>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Manage Rules
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classification Rules Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Classification Rules
          </CardTitle>
          <CardDescription>
            Severity levels, categories, and personnel impact classification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="font-medium">Critical Alerts</div>
                <div className="text-sm text-muted-foreground">Immediate action required</div>
                <Badge variant="destructive" className="mt-2">6 Rules</Badge>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Shield className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="font-medium">Security Matters</div>
                <div className="text-sm text-muted-foreground">Personnel safety impact</div>
                <Badge variant="secondary" className="mt-2">12 Rules</Badge>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="font-medium">Routine Updates</div>
                <div className="text-sm text-muted-foreground">Informational only</div>
                <Badge variant="outline" className="mt-2">8 Rules</Badge>
              </div>
            </div>
            
            <div className="flex justify-center gap-2">
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Configure Classifications
              </Button>
              <Button variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Manage Severity Levels
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Analysis Configuration
          </CardTitle>
          <CardDescription>
            Risk assessment rules, correlation settings, and automated analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Risk Assessment Engine</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Correlation Analysis</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Trend Detection</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Automated Scoring</span>
                <Badge variant="default">Active</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Button className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Configure Analysis Rules
              </Button>
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Advanced Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Assessment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Assessment Tools
          </CardTitle>
          <CardDescription>
            Threat evaluation, safety protocols, and security impact analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Shield className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Threat Evaluation</div>
                  <div className="text-xs opacity-75">Assess security threats</div>
                </div>
              </Button>

              <Button variant="outline" className="h-20 flex-col gap-2">
                <CheckCircle className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Safety Protocols</div>
                  <div className="text-xs opacity-75">Define response procedures</div>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Control Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Quality Control
          </CardTitle>
          <CardDescription>
            Data validation, error handling, and processing quality assurance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Data Validation Rules</span>
                <Badge variant="default">24 Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Error Detection</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Duplicate Prevention</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Quality Scoring</span>
                <Badge variant="default">Enabled</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Button className="w-full">
                <CheckCircle className="h-4 w-4 mr-2" />
                Configure Validation
              </Button>
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Error Handling Rules
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessingManagementTab;
