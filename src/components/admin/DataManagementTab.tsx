
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Download, 
  Upload, 
  Settings,
  Rss,
  Globe,
  FileText,
  Zap
} from 'lucide-react';
import InputsManagementTab from './data-management/InputsManagementTab';
import ProcessingManagementTab from './data-management/ProcessingManagementTab';
import OutputsManagementTab from './data-management/OutputsManagementTab';

const DataManagementTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('inputs');

  return (
    <div className="space-y-6">

      {/* Process Flow Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Data Flow Overview
          </CardTitle>
          <CardDescription>
            Understanding your data journey from collection to distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-center">
              <Upload className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">INPUTS</p>
                <p className="text-xs text-muted-foreground">Collection</p>
              </div>
            </div>
            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
            <div className="flex items-center gap-2 text-center">
              <Settings className="h-8 w-8 text-purple-500" />
              <div>
                <p className="font-medium">PROCESSING</p>
                <p className="text-xs text-muted-foreground">Analysis</p>
              </div>
            </div>
            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
            <div className="flex items-center gap-2 text-center">
              <Download className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">OUTPUTS</p>
                <p className="text-xs text-muted-foreground">Distribution</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <Upload className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Input Sources</p>
              <p className="text-lg font-bold">24</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Settings className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Processing Rules</p>
              <p className="text-lg font-bold">18</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Download className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Output Channels</p>
              <p className="text-lg font-bold">12</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Database className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Records Processed</p>
              <p className="text-lg font-bold">2,847</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Data Management Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inputs" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            INPUTS
          </TabsTrigger>
          <TabsTrigger value="processing" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            PROCESSING
          </TabsTrigger>
          <TabsTrigger value="outputs" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            OUTPUTS
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="inputs" className="space-y-4">
          <InputsManagementTab />
        </TabsContent>
        
        <TabsContent value="processing" className="space-y-4">
          <ProcessingManagementTab />
        </TabsContent>
        
        <TabsContent value="outputs" className="space-y-4">
          <OutputsManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataManagementTab;
