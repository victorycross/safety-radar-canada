
import React, { useState, useMemo } from 'react';
import { AlertLevel, IncidentSource, VerificationStatus, Incident } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, CheckCircle, AlertTriangle, AlertCircle, Loader2, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Download } from 'lucide-react';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';

interface EnhancedIncidentsListProps {
  filters: {
    search: string;
    alertLevels: AlertLevel[];
    verificationStatuses: VerificationStatus[];
    provinces: string[];
    sources: IncidentSource[];
    dateFrom: string;
    dateTo: string;
  };
  sortBy: 'timestamp' | 'title' | 'alertLevel' | 'province';
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onPageChange: (page: number, itemsPerPage?: number) => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
}

const EnhancedIncidentsList: React.FC<EnhancedIncidentsListProps> = ({
  filters,
  sortBy,
  sortOrder,
  currentPage,
  itemsPerPage,
  onSortChange,
  onPageChange,
  autoRefresh,
  onToggleAutoRefresh
}) => {
  const { incidents, provinces, loading, refreshData } = useSupabaseDataContext();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter and sort incidents
  const filteredAndSortedIncidents = useMemo(() => {
    let filtered = incidents.filter(incident => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!incident.title.toLowerCase().includes(searchLower) &&
            !incident.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Alert level filter
      if (filters.alertLevels.length > 0 && !filters.alertLevels.includes(incident.alertLevel)) {
        return false;
      }

      // Verification status filter
      if (filters.verificationStatuses.length > 0 && !filters.verificationStatuses.includes(incident.verificationStatus)) {
        return false;
      }

      // Province filter
      if (filters.provinces.length > 0 && !filters.provinces.includes(incident.provinceId)) {
        return false;
      }

      // Source filter
      if (filters.sources.length > 0 && !filters.sources.includes(incident.source)) {
        return false;
      }

      // Date filters
      if (filters.dateFrom) {
        const incidentDate = new Date(incident.timestamp);
        const fromDate = new Date(filters.dateFrom);
        if (incidentDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const incidentDate = new Date(incident.timestamp);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (incidentDate > toDate) return false;
      }

      return true;
    });

    // Sort incidents
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'alertLevel':
          const alertOrder = { 'severe': 3, 'warning': 2, 'normal': 1 };
          comparison = alertOrder[a.alertLevel] - alertOrder[b.alertLevel];
          break;
        case 'province':
          const provinceA = getProvinceName(a.provinceId);
          const provinceB = getProvinceName(b.provinceId);
          comparison = provinceA.localeCompare(provinceB);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [incidents, filters, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedIncidents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIncidents = filteredAndSortedIncidents.slice(startIndex, startIndex + itemsPerPage);

  const getProvinceName = (provinceId: string) => {
    const province = provinces.find(p => p.id === provinceId);
    return province ? province.name : provinceId;
  };

  const getAlertLevelBadge = (alertLevel: AlertLevel) => {
    switch (alertLevel) {
      case AlertLevel.SEVERE:
        return (
          <Badge className="bg-danger hover:bg-danger/90">
            <AlertCircle className="mr-1 h-3 w-3" />
            Severe
          </Badge>
        );
      case AlertLevel.WARNING:
        return (
          <Badge className="bg-warning hover:bg-warning/90">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Warning
          </Badge>
        );
      case AlertLevel.NORMAL:
        return (
          <Badge className="bg-success hover:bg-success/90">
            <Info className="mr-1 h-3 w-3" />
            Normal
          </Badge>
        );
    }
  };

  const getVerificationBadge = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return (
          <Badge variant="outline" className="text-success border-success">
            <CheckCircle className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        );
      case VerificationStatus.UNVERIFIED:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Unverified
          </Badge>
        );
    }
  };

  const formatDate = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSort = (field: string) => {
    const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(field, newSortOrder);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const handleExport = () => {
    // Create CSV export
    const csvContent = [
      ['Date', 'Title', 'Province', 'Alert Level', 'Verification', 'Source', 'Description'].join(','),
      ...filteredAndSortedIncidents.map(incident => [
        formatDate(incident.timestamp),
        `"${incident.title}"`,
        getProvinceName(incident.provinceId),
        incident.alertLevel,
        incident.verificationStatus,
        incident.source,
        `"${incident.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incidents-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with stats and controls */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">
            Incident Reports ({filteredAndSortedIncidents.length} total)
          </h3>
          <p className="text-sm text-muted-foreground">
            Showing {Math.min(startIndex + 1, filteredAndSortedIncidents.length)} - {Math.min(startIndex + itemsPerPage, filteredAndSortedIncidents.length)} of {filteredAndSortedIncidents.length} incidents
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={filteredAndSortedIncidents.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={onToggleAutoRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Auto Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      {filteredAndSortedIncidents.length === 0 ? (
        <Card className="text-center py-8 border-2 border-dashed rounded-lg">
          <Info className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-lg font-medium">No incidents found</p>
          <p className="text-muted-foreground">
            Try adjusting your filters to see more results
          </p>
        </Card>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center gap-2">
                      Date {getSortIcon('timestamp')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-2">
                      Title {getSortIcon('title')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('province')}
                  >
                    <div className="flex items-center gap-2">
                      Province {getSortIcon('province')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('alertLevel')}
                  >
                    <div className="flex items-center gap-2">
                      Alert Level {getSortIcon('alertLevel')}
                    </div>
                  </TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="font-medium">
                      {formatDate(incident.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{incident.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-md">
                          {incident.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getProvinceName(incident.provinceId)}</TableCell>
                    <TableCell>{getAlertLevelBadge(incident.alertLevel)}</TableCell>
                    <TableCell>{getVerificationBadge(incident.verificationStatus)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-secondary/50">
                        {incident.source}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => onPageChange(1, parseInt(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EnhancedIncidentsList;
