
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileText, Users, AlertTriangle } from 'lucide-react';

interface HubBulkActionsProps {
  onImportComplete: () => void;
}

const HubBulkActions: React.FC<HubBulkActionsProps> = ({ onImportComplete }) => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [bulkEmployeeData, setBulkEmployeeData] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileImport = async () => {
    if (!importFile) return;

    setLoading(true);
    try {
      const text = await importFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('Invalid CSV format');
      }

      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Import Successful',
        description: `Processed ${lines.length - 1} hub records`,
      });

      setImportFile(null);
      onImportComplete();
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: 'Please check your file format and try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkEmployeeUpdate = async () => {
    if (!bulkEmployeeData.trim()) return;

    setLoading(true);
    try {
      const lines = bulkEmployeeData.split('\n').filter(line => line.trim());
      
      // Simulate bulk update process
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: 'Bulk Update Complete',
        description: `Updated employee counts for ${lines.length} hubs`,
      });

      setBulkEmployeeData('');
      onImportComplete();
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Please check your data format and try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      'Hub ID,Name,Country,Code,Employee Count,Alert Level,Active',
      'sample-id-1,New York Hub,USA,NYC,250,normal,true',
      'sample-id-2,London Hub,UK,LON,180,warning,true'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hub_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Template Downloaded',
      description: 'Use this template for bulk hub imports',
    });
  };

  return (
    <div className="space-y-6">
      {/* File Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Bulk Hub Import</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={downloadTemplate} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="import-file">Select CSV File</Label>
            <Input
              id="import-file"
              type="file"
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
          </div>
          
          {importFile && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Ready to import: {importFile.name} ({Math.round(importFile.size / 1024)} KB)
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleFileImport} 
            disabled={!importFile || loading}
            className="w-full"
          >
            {loading ? 'Importing...' : 'Import Hubs'}
          </Button>
        </CardContent>
      </Card>

      {/* Bulk Employee Count Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Bulk Employee Count Update</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee-data">Employee Count Data</Label>
            <Textarea
              id="employee-data"
              placeholder="Enter data in format: HubID,EmployeeCount&#10;hub-1,250&#10;hub-2,180"
              value={bulkEmployeeData}
              onChange={(e) => setBulkEmployeeData(e.target.value)}
              rows={6}
            />
          </div>
          
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Format Requirements:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>One hub per line: HubID,EmployeeCount</li>
                  <li>Use comma separation</li>
                  <li>Hub ID must match existing hubs</li>
                </ul>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleBulkEmployeeUpdate} 
            disabled={!bulkEmployeeData.trim() || loading}
            className="w-full"
          >
            {loading ? 'Updating...' : 'Update Employee Counts'}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export All Hub Data
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="h-4 w-4 mr-2" />
              Generate Employee Report
            </Button>
            <Button variant="outline" className="justify-start">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Export Alert Summary
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Create Hub Audit Log
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HubBulkActions;
