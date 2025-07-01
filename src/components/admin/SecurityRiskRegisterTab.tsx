
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Search, Download, Eye, Edit } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import RiskDetailModal from './security-risk/RiskDetailModal';
import RiskEditModal from './security-risk/RiskEditModal';
import RiskExporter from './security-risk/RiskExporter';

interface SecurityRisk {
  id: string;
  threat_category: string;
  likelihood: number;
  impact: number;
  preparedness_gap: number;
  rpn: number;
  priority: 'high' | 'medium' | 'low';
  last_reviewed: string;
  assigned_lead: string;
  current_alerts: string;
  notes: string;
  playbook: string;
  live_feeds: any; // Using any to handle Json type from Supabase
}

const SecurityRiskRegisterTab = () => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [leadFilter, setLeadFilter] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<SecurityRisk | null>(null);
  const [editingRisk, setEditingRisk] = useState<SecurityRisk | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: risks, isLoading, refetch } = useQuery({
    queryKey: ['security-risks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('national_security_risks')
        .select('*')
        .order('rpn', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to handle the live_feeds properly
      return data.map(risk => ({
        ...risk,
        live_feeds: risk.live_feeds || []
      })) as SecurityRisk[];
    }
  });

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-orange-100 text-orange-800 border-orange-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const filteredRisks = risks?.filter(risk => {
    const matchesSearch = risk.threat_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         risk.assigned_lead?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         risk.current_alerts?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || risk.priority === priorityFilter;
    const matchesLead = leadFilter === 'all' || risk.assigned_lead === leadFilter;
    
    return matchesSearch && matchesPriority && matchesLead;
  });

  const uniqueLeads = [...new Set(risks?.map(risk => risk.assigned_lead).filter(Boolean))];

  const handleViewDetails = (risk: SecurityRisk) => {
    setSelectedRisk(risk);
    setShowDetailModal(true);
  };

  const handleEdit = (risk: SecurityRisk) => {
    setEditingRisk(risk);
    setShowEditModal(true);
  };

  const handleEditComplete = () => {
    setShowEditModal(false);
    setEditingRisk(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            National Security Risk Register
          </h2>
          <p className="text-muted-foreground">
            Comprehensive threat assessment and response planning dashboard
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <RiskExporter risks={filteredRisks || []} />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search threats, leads, alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>

            <Select value={leadFilter} onValueChange={setLeadFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leads</SelectItem>
                {uniqueLeads.map(lead => (
                  <SelectItem key={lead} value={lead || ''}>{lead}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setPriorityFilter('all');
                setLeadFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Risk Register Table */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment Matrix</CardTitle>
          <CardDescription>
            Showing {filteredRisks?.length || 0} threats sorted by Risk Priority Number (RPN)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Threat Category</TableHead>
                  <TableHead className="text-center">L</TableHead>
                  <TableHead className="text-center">I</TableHead>
                  <TableHead className="text-center">G</TableHead>
                  <TableHead className="text-center">RPN</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Last Reviewed</TableHead>
                  <TableHead>Assigned Lead</TableHead>
                  <TableHead>Current Alerts</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRisks?.map((risk) => (
                  <TableRow key={risk.id}>
                    <TableCell className="font-medium">
                      {risk.threat_category}
                    </TableCell>
                    <TableCell className="text-center">{risk.likelihood}</TableCell>
                    <TableCell className="text-center">{risk.impact}</TableCell>
                    <TableCell className="text-center">{risk.preparedness_gap}</TableCell>
                    <TableCell className="text-center font-bold">{risk.rpn}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityBadge(risk.priority)}>
                        {risk.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {risk.last_reviewed ? new Date(risk.last_reviewed).toLocaleDateString() : 'Not set'}
                    </TableCell>
                    <TableCell>{risk.assigned_lead || 'Unassigned'}</TableCell>
                    <TableCell className="max-w-48 truncate">
                      {risk.current_alerts || 'None'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(risk)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isAdmin() && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(risk)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedRisk && (
        <RiskDetailModal
          risk={selectedRisk}
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
        />
      )}

      {/* Edit Modal */}
      {editingRisk && (
        <RiskEditModal
          risk={editingRisk}
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSave={handleEditComplete}
        />
      )}
    </div>
  );
};

export default SecurityRiskRegisterTab;
