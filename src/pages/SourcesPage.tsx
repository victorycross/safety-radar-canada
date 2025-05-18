
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Info, AlertTriangle, Globe } from "lucide-react";
import { IncidentSource, VerificationStatus } from "@/types";
import { Link } from 'react-router-dom';

const SourcesPage = () => {
  const sources = [
    {
      id: "alert-ready",
      name: "Alert Ready",
      description: "Canada's National Public Alerting System for emergency notifications",
      type: IncidentSource.POLICE,
      verificationStatus: VerificationStatus.VERIFIED,
      lastUpdate: "real-time",
      route: "/alert-ready"
    },
    {
      id: "police",
      name: "Police Reports",
      description: "Official reports from local and provincial police forces across Canada",
      type: IncidentSource.POLICE,
      verificationStatus: VerificationStatus.VERIFIED,
      lastUpdate: "10 minutes ago"
    },
    {
      id: "global-security",
      name: "Global Security",
      description: "Internal security monitoring and reporting from corporate security team",
      type: IncidentSource.GLOBAL_SECURITY,
      verificationStatus: VerificationStatus.VERIFIED,
      lastUpdate: "5 minutes ago"
    },
    {
      id: "us-soc",
      name: "US Security Operations Centre",
      description: "Intelligence from US-based security operations center",
      type: IncidentSource.US_SOC,
      verificationStatus: VerificationStatus.VERIFIED,
      lastUpdate: "15 minutes ago"
    },
    {
      id: "everbridge",
      name: "Everbridge Alerts",
      description: "Emergency notifications from Everbridge critical event management platform",
      type: IncidentSource.EVERBRIDGE,
      verificationStatus: VerificationStatus.VERIFIED,
      lastUpdate: "30 minutes ago"
    },
    {
      id: "news",
      name: "News Aggregator",
      description: "Selected news sources covering relevant security events",
      type: IncidentSource.NEWS,
      verificationStatus: VerificationStatus.UNVERIFIED,
      lastUpdate: "3 minutes ago"
    },
    {
      id: "crowdsourced",
      name: "Crowdsourced Reports",
      description: "Aggregated data from social media and public reporting platforms",
      type: IncidentSource.CROWDSOURCED,
      verificationStatus: VerificationStatus.UNVERIFIED,
      lastUpdate: "1 minute ago"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">External Sources</h1>
        <p className="text-muted-foreground">Connected information sources feeding the security dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map((source) => (
          <Card key={source.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle>{source.name}</CardTitle>
                {source.verificationStatus === VerificationStatus.VERIFIED ? (
                  <Badge className="bg-success hover:bg-success/90">Verified</Badge>
                ) : (
                  <Badge variant="outline">Unverified</Badge>
                )}
              </div>
              <CardDescription>{source.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center text-sm text-muted-foreground">
                {source.id === "alert-ready" ? (
                  <AlertTriangle className="h-3 w-3 mr-1 text-warning" />
                ) : (
                  <Bell className="h-3 w-3 mr-1" />
                )}
                <span>Last update: {source.lastUpdate}</span>
              </div>
            </CardContent>
            <CardFooter>
              {source.route ? (
                <Link to={source.route} className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <Globe className="mr-2 h-4 w-4" />
                    View Data Feed
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" className="w-full">
                  <Info className="mr-2 h-4 w-4" />
                  Configure Source
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SourcesPage;
