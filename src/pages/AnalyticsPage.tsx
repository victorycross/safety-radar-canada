
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSecurity } from "@/context/SecurityContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { AlertLevel, IncidentSource } from "@/types";

const AnalyticsPage = () => {
  const { incidents, provinces } = useSecurity();
  
  // Count incidents by alert level
  const incidentsByAlertLevel = [
    {
      name: "Severe",
      value: incidents.filter(i => i.alertLevel === AlertLevel.SEVERE).length,
      color: "#e11d48"
    },
    {
      name: "Warning",
      value: incidents.filter(i => i.alertLevel === AlertLevel.WARNING).length,
      color: "#f59e0b"
    },
    {
      name: "Normal",
      value: incidents.filter(i => i.alertLevel === AlertLevel.NORMAL).length,
      color: "#10b981"
    }
  ];
  
  // Count incidents by source
  const incidentsBySource = Object.values(IncidentSource).map(source => ({
    name: source,
    value: incidents.filter(i => i.source === source).length,
    color: "#3b82f6"
  }));
  
  // Count provinces by alert level
  const provincesByAlertLevel = [
    {
      name: "Severe",
      value: provinces.filter(p => p.alertLevel === AlertLevel.SEVERE).length,
      color: "#e11d48"
    },
    {
      name: "Warning",
      value: provinces.filter(p => p.alertLevel === AlertLevel.WARNING).length,
      color: "#f59e0b"
    },
    {
      name: "Normal",
      value: provinces.filter(p => p.alertLevel === AlertLevel.NORMAL).length,
      color: "#10b981"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Security incident analytics and metrics</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Incidents</CardTitle>
            <CardDescription>All reported security incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{incidents.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Affected Provinces</CardTitle>
            <CardDescription>Provinces with active incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(incidents.map(i => i.provinceId)).size}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Latest Incident</CardTitle>
            <CardDescription>Most recently reported</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium truncate">
              {incidents.length > 0 
                ? incidents.sort((a, b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                  )[0].title
                : "No incidents"}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Alert Level</CardTitle>
            <CardDescription>Distribution of incidents by severity</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incidentsByAlertLevel}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {incidentsByAlertLevel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Source</CardTitle>
            <CardDescription>Distribution of incidents by reporting source</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incidentsBySource.filter(d => d.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {incidentsBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 40}, 70%, 60%)`} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Provinces by Status</CardTitle>
            <CardDescription>Current state of provinces</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={provincesByAlertLevel}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {provincesByAlertLevel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
