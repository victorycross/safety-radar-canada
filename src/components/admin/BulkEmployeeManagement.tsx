import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { bulkUpdateEmployeeCounts } from '@/services/employeeService';
import { fetchCities, updateEmployeeLocation } from '@/services/cityService';
import { toast } from '@/components/ui/use-toast';
import { Download, Upload, FileText, MapPin, Users } from 'lucide-react';

const BulkEmployeeManagement = () => {
  const { provinces, refreshData } = useSupabaseDataContext();
  const [csvData, setCsvData] = useState<string>('');
  const [cityCsvData, setCityCsvData] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const generateCSVTemplate = () => {
    const headers = 'Province Code,Province Name,Current Count,New Count,Change Reason\n';
    const rows = provinces.map(province => 
      `${province.code},${province.name},${province.employeeCount},,`
    ).join('\n');
    
    return headers + rows;
  };

  const downloadCSVTemplate = () => {
    const csv = generateCSVTemplate();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee-counts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "CSV Downloaded",
      description: "Employee count template has been downloaded",
    });
  };

  const parseCSVData = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have at least a header and one data row');
    
    const headers = lines[0].split(',').map(h => h.trim());
    const expectedHeaders = ['Province Code', 'Province Name', 'Current Count', 'New Count', 'Change Reason'];
    
    if (!headers.includes('New Count') || !headers.includes('Province Code')) {
      throw new Error('CSV must include "Province Code" and "New Count" columns');
    }
    
    const updates = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < headers.length) continue;
      
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      const provinceCode = row['Province Code'];
      const newCountStr = row['New Count'];
      const changeReason = row['Change Reason'] || 'Bulk update via CSV';
      
      if (!provinceCode || !newCountStr) continue;
      
      const province = provinces.find(p => p.code.toLowerCase() === provinceCode.toLowerCase());
      if (!province) {
        console.warn(`Province not found for code: ${provinceCode}`);
        continue;
      }
      
      const newCount = parseInt(newCountStr);
      if (isNaN(newCount) || newCount < 0) {
        throw new Error(`Invalid employee count for ${provinceCode}: ${newCountStr}`);
      }
      
      updates.push({
        provinceId: province.id,
        employeeCount: newCount,
        changeReason
      });
    }
    
    return updates;
  };

  const handleBulkUpdate = async () => {
    if (!csvData.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter CSV data",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const updates = parseCSVData(csvData);
      
      if (updates.length === 0) {
        toast({
          title: "No Updates",
          description: "No valid updates found in CSV data",
          variant: "destructive"
        });
        return;
      }

      const results = await bulkUpdateEmployeeCounts(updates);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      if (failed === 0) {
        toast({
          title: "Bulk Update Successful",
          description: `Successfully updated ${successful} provinces`,
        });
        setCsvData('');
        await refreshData();
      } else {
        toast({
          title: "Partial Success",
          description: `${successful} succeeded, ${failed} failed. Check console for details.`,
          variant: "destructive"
        });
        
        results.filter(r => !r.success).forEach(result => {
          console.error(`Failed to update province ${result.provinceId}:`, result.error);
        });
      }
    } catch (error: any) {
      console.error('Bulk update error:', error);
      toast({
        title: "Bulk Update Failed",
        description: error.message || "Failed to process bulk update",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // New city-level CSV functions
  const generateCityCSVTemplate = async () => {
    try {
      const cities = await fetchCities();
      const headers = 'City Code,City Name,Province Code,Home Base,Current Location,Travel Away,Change Reason\n';
      const rows = cities.map(city => {
        const province = provinces.find(p => p.id === city.provinceId);
        return `${city.code},${city.name},${province?.code || ''},0,0,0,`;
      }).join('\n');
      
      return headers + rows;
    } catch (error) {
      console.error('Error generating city CSV template:', error);
      throw error;
    }
  };

  const downloadCityCSVTemplate = async () => {
    try {
      const csv = await generateCityCSVTemplate();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `city-employee-counts-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "City CSV Downloaded",
        description: "City-level employee count template has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate city CSV template",
        variant: "destructive"
      });
    }
  };

  const parseCityCSVData = async (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have at least a header and one data row');
    
    const headers = lines[0].split(',').map(h => h.trim());
    const cities = await fetchCities();
    
    if (!headers.includes('City Code') || !headers.includes('Home Base')) {
      throw new Error('CSV must include "City Code" and employee count columns');
    }
    
    const updates = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < headers.length) continue;
      
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      const cityCode = row['City Code'];
      const homeBase = parseInt(row['Home Base']) || 0;
      const currentLocation = parseInt(row['Current Location']) || 0;
      const travelAway = parseInt(row['Travel Away']) || 0;
      
      if (!cityCode) continue;
      
      const city = cities.find(c => c.code.toLowerCase() === cityCode.toLowerCase());
      if (!city) {
        console.warn(`City not found for code: ${cityCode}`);
        continue;
      }
      
      if (homeBase < 0 || currentLocation < 0 || travelAway < 0) {
        throw new Error(`Invalid employee counts for ${cityCode}`);
      }
      
      updates.push({
        cityId: city.id,
        homeBaseCount: homeBase,
        currentLocationCount: currentLocation,
        travelAwayCount: travelAway
      });
    }
    
    return updates;
  };

  const handleCityBulkUpdate = async () => {
    if (!cityCsvData.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter city CSV data",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const updates = await parseCityCSVData(cityCsvData);
      
      if (updates.length === 0) {
        toast({
          title: "No Updates",
          description: "No valid city updates found in CSV data",
          variant: "destructive"
        });
        return;
      }

      const results = [];
      for (const update of updates) {
        try {
          await updateEmployeeLocation(
            update.cityId,
            update.homeBaseCount,
            update.currentLocationCount,
            update.travelAwayCount,
            'admin'
          );
          results.push({ success: true, cityId: update.cityId });
        } catch (error) {
          results.push({ success: false, cityId: update.cityId, error });
        }
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      if (failed === 0) {
        toast({
          title: "City Bulk Update Successful",
          description: `Successfully updated ${successful} cities`,
        });
        setCityCsvData('');
        await refreshData();
      } else {
        toast({
          title: "Partial Success",
          description: `${successful} succeeded, ${failed} failed. Check console for details.`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('City bulk update error:', error);
      toast({
        title: "City Bulk Update Failed",
        description: error.message || "Failed to process city bulk update",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="province" className="w-full">
        <TabsList>
          <TabsTrigger value="province" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Province Level
          </TabsTrigger>
          <TabsTrigger value="city" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            City Level
          </TabsTrigger>
        </TabsList>

        <TabsContent value="province">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Province-Level Bulk Management
              </CardTitle>
              <CardDescription>
                Upload CSV data to update multiple provinces at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={downloadCSVTemplate} variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download Province CSV Template
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="csv-data">Province CSV Data</Label>
                <Textarea
                  id="csv-data"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="Paste your province CSV data here..."
                  rows={8}
                  className="font-mono text-sm"
                />
                <div className="text-xs text-muted-foreground">
                  Expected format: Province Code, Province Name, Current Count, New Count, Change Reason
                </div>
              </div>

              <Button 
                onClick={handleBulkUpdate} 
                disabled={!csvData.trim() || isProcessing}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isProcessing ? 'Processing...' : 'Process Province Bulk Update'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="city">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                City-Level Bulk Management
              </CardTitle>
              <CardDescription>
                Upload CSV data to update city-level employee distributions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={downloadCityCSVTemplate} variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download City CSV Template
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city-csv-data">City CSV Data</Label>
                <Textarea
                  id="city-csv-data"
                  value={cityCsvData}
                  onChange={(e) => setCityCsvData(e.target.value)}
                  placeholder="Paste your city CSV data here..."
                  rows={8}
                  className="font-mono text-sm"
                />
                <div className="text-xs text-muted-foreground">
                  Expected format: City Code, City Name, Province Code, Home Base, Current Location, Travel Away, Change Reason
                </div>
              </div>

              <Button 
                onClick={handleCityBulkUpdate} 
                disabled={!cityCsvData.trim() || isProcessing}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isProcessing ? 'Processing...' : 'Process City Bulk Update'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BulkEmployeeManagement;
