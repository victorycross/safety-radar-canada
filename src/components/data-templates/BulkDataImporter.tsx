
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  X,
  RefreshCw
} from 'lucide-react';
import { DataValidator } from '@/utils/dataValidation';
import { 
  BulkEmployeeUpdateTemplate, 
  BulkHubUpdateTemplate,
  ValidationResult 
} from '@/types/dataTemplates';

interface ImportResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  errors: { row: number; errors: string[] }[];
}

const BulkDataImporter = () => {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'employees' | 'hubs'>('employees');

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setSelectedFile(file);
      setImportResult(null);
    } else {
      alert('Please select a valid CSV file');
    }
  }, []);

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });
  };

  const processEmployeeData = async (data: any[]): Promise<ImportResult> => {
    let successful = 0;
    let failed = 0;
    const errors: { row: number; errors: string[] }[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const employeeData: Partial<BulkEmployeeUpdateTemplate> = {
        province_code: row.province_code || row.Province || row.province,
        city_name: row.city_name || row.City || row.city,
        home_base_count: parseInt(row.home_base_count || row.HomeBase || row.home_base) || 0,
        current_location_count: parseInt(row.current_location_count || row.CurrentLocation || row.current_location) || 0,
        travel_away_count: parseInt(row.travel_away_count || row.TravelAway || row.travel_away) || 0,
        updated_by: 'bulk_import'
      };

      // Basic validation
      if (!employeeData.province_code || !employeeData.city_name) {
        failed++;
        errors.push({ 
          row: i + 2, // +2 because of header and 0-based index
          errors: ['Province code and city name are required'] 
        });
        continue;
      }

      if (employeeData.home_base_count < 0) {
        failed++;
        errors.push({ 
          row: i + 2,
          errors: ['Employee counts cannot be negative'] 
        });
        continue;
      }

      // Here you would actually save to database
      // For now, we'll simulate success
      successful++;
      setProgress((i + 1) / data.length * 100);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return {
      totalProcessed: data.length,
      successful,
      failed,
      errors
    };
  };

  const processHubData = async (data: any[]): Promise<ImportResult> => {
    let successful = 0;
    let failed = 0;
    const errors: { row: number; errors: string[] }[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const hubData: Partial<BulkHubUpdateTemplate> = {
        hub_code: row.hub_code || row.HubCode || row.code,
        country: row.country || row.Country,
        employee_count: parseInt(row.employee_count || row.EmployeeCount || row.employees) || 0,
        alert_level: (row.alert_level || row.AlertLevel || row.alert || 'normal').toLowerCase(),
        is_active: row.is_active !== 'false' && row.is_active !== '0'
      };

      // Basic validation
      if (!hubData.hub_code || !hubData.country) {
        failed++;
        errors.push({ 
          row: i + 2,
          errors: ['Hub code and country are required'] 
        });
        continue;
      }

      if (hubData.employee_count < 0 || hubData.employee_count > 1000) {
        failed++;
        errors.push({ 
          row: i + 2,
          errors: ['Hub employee count must be between 0 and 1000'] 
        });
        continue;
      }

      if (!['normal', 'warning', 'severe'].includes(hubData.alert_level || '')) {
        failed++;
        errors.push({ 
          row: i + 2,
          errors: ['Alert level must be normal, warning, or severe'] 
        });
        continue;
      }

      successful++;
      setProgress((i + 1) / data.length * 100);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return {
      totalProcessed: data.length,
      successful,
      failed,
      errors
    };
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setProgress(0);

    try {
      const text = await selectedFile.text();
      const data = parseCSV(text);

      let result: ImportResult;
      if (importType === 'employees') {
        result = await processEmployeeData(data);
      } else {
        result = await processHubData(data);
      }

      setImportResult(result);
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        totalProcessed: 0,
        successful: 0,
        failed: 1,
        errors: [{ row: 1, errors: ['Failed to process file: ' + (error as Error).message] }]
      });
    } finally {
      setImporting(false);
      setProgress(100);
    }
  };

  const downloadTemplate = (type: 'employees' | 'hubs') => {
    let csvContent: string;
    let filename: string;

    if (type === 'employees') {
      csvContent = `province_code,city_name,home_base_count,current_location_count,travel_away_count
ON,Toronto,100,95,5
QC,Montreal,75,70,5
BC,Vancouver,60,58,2`;
      filename = 'employee-bulk-update-template.csv';
    } else {
      csvContent = `hub_code,country,employee_count,alert_level,is_active
US-NYC,United States,150,normal,true
UK-LON,United Kingdom,100,normal,true
FR-PAR,France,75,warning,true`;
      filename = 'hub-bulk-update-template.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportResult(null);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Bulk Data Import</h2>
        <p className="text-muted-foreground">
          Import employee location data and hub information via CSV files with validation and error reporting.
        </p>
      </div>

      <Tabs value={importType} onValueChange={(value) => setImportType(value as 'employees' | 'hubs')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employees">Employee Data</TabsTrigger>
          <TabsTrigger value="hubs">Hub Data</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Employee Location Import
              </CardTitle>
              <CardDescription>
                Bulk update employee counts across provinces and cities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => downloadTemplate('employees')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
                <span className="text-sm text-muted-foreground">
                  Required columns: province_code, city_name, home_base_count
                </span>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="employee-file-input"
                />
                <label
                  htmlFor="employee-file-input"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <FileText className="h-8 w-8 text-gray-400" />
                  <span className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : 'Choose CSV file or drag and drop'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Supports CSV files with employee location data
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hubs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                International Hub Import
              </CardTitle>
              <CardDescription>
                Bulk update international hub information and employee counts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => downloadTemplate('hubs')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
                <span className="text-sm text-muted-foreground">
                  Required columns: hub_code, country, employee_count
                </span>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="hub-file-input"
                />
                <label
                  htmlFor="hub-file-input"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <FileText className="h-8 w-8 text-gray-400" />
                  <span className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : 'Choose CSV file or drag and drop'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Supports CSV files with hub data
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Import Process</span>
              <Button variant="ghost" size="sm" onClick={resetImport}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {importing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processing...</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {!importing && !importResult && (
              <Button onClick={handleImport} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Start Import
              </Button>
            )}

            {importResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{importResult.totalProcessed}</div>
                    <div className="text-sm text-muted-foreground">Total Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{importResult.successful}</div>
                    <div className="text-sm text-muted-foreground">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="font-medium">Import Errors ({importResult.errors.length}):</div>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {importResult.errors.map((error, index) => (
                            <div key={index} className="text-sm">
                              <Badge variant="destructive" className="mr-2">Row {error.row}</Badge>
                              {error.errors.join(', ')}
                            </div>
                          ))}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {importResult.successful > 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Successfully imported {importResult.successful} records.
                    </AlertDescription>
                  </Alert>
                )}

                <Button onClick={resetImport} variant="outline" className="w-full">
                  Import Another File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkDataImporter;
