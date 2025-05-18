
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Search, Filter, Table as TableIcon } from "lucide-react";
import TorontoDataMap from "@/components/toronto/TorontoDataMap";
import TorontoDataFilters from "@/components/toronto/TorontoDataFilters";

interface TorontoIncident {
  id: string;
  event_id: string | null;
  category: string | null;
  division: string | null;
  occurrence_date: string | null;
  premises_type: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  report_date: string | null;
}

const TorontoDataPage = () => {
  const [incidents, setIncidents] = useState<TorontoIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "map">("table");
  const [filters, setFilters] = useState({
    category: "",
    division: "",
    neighborhood: "",
    premises_type: "",
  });
  const { toast } = useToast();
  
  useEffect(() => {
    fetchData();
  }, [filters]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("toronto_police_incidents")
        .select("*");
      
      // Apply filters if they exist
      if (filters.category) {
        query = query.ilike("category", `%${filters.category}%`);
      }
      if (filters.division) {
        query = query.ilike("division", `%${filters.division}%`);
      }
      if (filters.neighborhood) {
        query = query.ilike("neighborhood", `%${filters.neighborhood}%`);
      }
      if (filters.premises_type) {
        query = query.ilike("premises_type", `%${filters.premises_type}%`);
      }
      
      // Limit results for performance
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error("Error fetching Toronto Police incidents:", error);
      toast({
        variant: "destructive",
        title: "Failed to load incidents",
        description: "Could not retrieve the Toronto Police incidents data.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Filter incidents by search term
  const filteredIncidents = incidents.filter(incident => 
    incident.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.division?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.premises_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };
  
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Toronto Police Data Explorer</h1>
        <p className="text-muted-foreground">Explore and analyze imported police incidents</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by category, division, neighborhood..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="h-4 w-4 mr-1" />
            Table
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("map")}
          >
            <Filter className="h-4 w-4 mr-1" />
            Map
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filter Data</CardTitle>
              <CardDescription>Refine results by specific criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <TorontoDataFilters onFilterChange={handleFilterChange} />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-1">
              <div className="flex justify-between items-center">
                <CardTitle>Incidents {!loading && `(${filteredIncidents.length})`}</CardTitle>
                <Badge variant="outline">{loading ? "Loading..." : "Last updated: " + formatDate(incidents[0]?.report_date || null)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center my-8">
                  <p className="text-muted-foreground">Loading data...</p>
                </div>
              ) : filteredIncidents.length === 0 ? (
                <div className="flex justify-center my-8">
                  <p className="text-muted-foreground">No incidents found matching your criteria.</p>
                </div>
              ) : viewMode === "table" ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Division</TableHead>
                        <TableHead>Neighborhood</TableHead>
                        <TableHead>Premises</TableHead>
                        <TableHead>Occurrence Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIncidents.map((incident) => (
                        <TableRow key={incident.id}>
                          <TableCell className="font-medium">{incident.category || "Unknown"}</TableCell>
                          <TableCell>{incident.division || "Unknown"}</TableCell>
                          <TableCell>{incident.neighborhood || "Unknown"}</TableCell>
                          <TableCell>{incident.premises_type || "Unknown"}</TableCell>
                          <TableCell>{formatDate(incident.occurrence_date)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <TorontoDataMap incidents={filteredIncidents} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TorontoDataPage;
