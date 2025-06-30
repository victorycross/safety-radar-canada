
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download } from 'lucide-react';

interface FileImportSectionProps {
  onImportComplete: () => void;
}

const FileImportSection: React.FC<FileImportSectionProps> = ({ onImportComplete }) => {
  const [importFile, setImportFile] = useState<File | null>(null);
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
  );
};

export default FileImportSection;
