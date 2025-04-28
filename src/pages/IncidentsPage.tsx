
import React from 'react';
import IncidentsList from '@/components/incidents/IncidentsList';
import IncidentForm from '@/components/forms/IncidentForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const IncidentsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Incident Reports</h1>
        <p className="text-muted-foreground">View and manage security incidents</p>
      </div>
      
      <Tabs defaultValue="incidents">
        <TabsList>
          <TabsTrigger value="incidents">View Incidents</TabsTrigger>
          <TabsTrigger value="add-incident">Add Incident (Authorized Users)</TabsTrigger>
        </TabsList>
        <TabsContent value="incidents" className="pt-4">
          <IncidentsList />
        </TabsContent>
        <TabsContent value="add-incident" className="pt-4">
          <div className="max-w-2xl">
            <IncidentForm isAuthorized={true} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IncidentsPage;
