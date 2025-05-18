import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, Filter, Download, ExternalLink, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchDatasets, fetchDatasetDetails, Dataset, DatasetDetail } from "@/services/openDataService";
import DatasetCard from "@/components/opendata/DatasetCard";
import DatasetDetailPanel from "@/components/opendata/DatasetDetail";

const OpenDataPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  
  // Fetch datasets
  const { data: datasets, isLoading, error, refetch } = useQuery({
    queryKey: ['openData', searchTerm],
    queryFn: () => fetchDatasets(searchTerm),
  });
  
  // Fetch dataset details when selected
  const { data: datasetDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['datasetDetails', selectedDataset?.id],
    queryFn: () => selectedDataset?.id ? fetchDatasetDetails(selectedDataset.id) : null,
    enabled: !!selectedDataset?.id,
  });
  
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading datasets",
        description: "Failed to fetch data from Open Government API.",
      });
    }
  }, [error, toast]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Open Government Data Explorer</h1>
        <p className="text-muted-foreground">
          Explore public data from Canada's Open Government Portal
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Search Datasets</CardTitle>
          <CardDescription>
            Search for datasets in the Open Government Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search datasets..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="grid">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
          {datasets && <Badge variant="outline">{datasets.length} datasets found</Badge>}
        </div>
        
        <TabsContent value="grid" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Loading datasets...</p>
            </div>
          ) : datasets && datasets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {datasets.map((dataset) => (
                <DatasetCard 
                  key={dataset.id} 
                  dataset={dataset} 
                  onClick={() => setSelectedDataset(dataset)} 
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex justify-center py-8">
                <p className="text-muted-foreground">No datasets found. Try another search term.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="table" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Loading datasets...</p>
            </div>
          ) : datasets && datasets.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Resources</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datasets.map((dataset) => (
                    <TableRow key={dataset.id}>
                      <TableCell className="font-medium">{dataset.title}</TableCell>
                      <TableCell>{dataset.organization?.title || 'Unknown'}</TableCell>
                      <TableCell>{dataset.resources?.length || 0}</TableCell>
                      <TableCell>{new Date(dataset.metadata_modified).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedDataset(dataset)}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card>
              <CardContent className="flex justify-center py-8">
                <p className="text-muted-foreground">No datasets found. Try another search term.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {selectedDataset && (
        <DatasetDetailPanel 
          dataset={selectedDataset} 
          details={datasetDetails} 
          isLoading={isLoadingDetails}
          onClose={() => setSelectedDataset(null)}
        />
      )}
    </div>
  );
};

export default OpenDataPage;
