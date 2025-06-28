
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Clock, MapPin, ExternalLink } from 'lucide-react';

const EmergencyContacts = () => {
  const contacts = [
    {
      title: "Emergency Services",
      number: "911",
      description: "For immediate life-threatening emergencies",
      availability: "24/7",
      type: "emergency",
      priority: 1
    },
    {
      title: "Global Security Operations",
      number: "+1 (555) 123-4567",
      email: "security@company.com",
      description: "Primary security team contact",
      availability: "24/7",
      type: "security",
      priority: 2
    },
    {
      title: "Regional Security Coordinator",
      number: "+1 (555) 123-4568",
      email: "regional.security@company.com",
      description: "Regional security team",
      availability: "Business Hours",
      type: "security",
      priority: 3
    },
    {
      title: "Employee Assistance Program",
      number: "+1 (555) 123-4569",
      email: "eap@company.com",
      description: "Support and counseling services",
      availability: "24/7",
      type: "support",
      priority: 4
    }
  ];

  const resources = [
    {
      title: "Security Handbook",
      description: "Complete guide to security procedures",
      url: "#",
      type: "document"
    },
    {
      title: "Emergency Procedures",
      description: "Step-by-step emergency response guide",
      url: "#",
      type: "document"
    },
    {
      title: "Incident Response Team",
      description: "Contact information for local response teams",
      url: "#",
      type: "contact"
    }
  ];

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contacts</CardTitle>
          <CardDescription>Important numbers for immediate assistance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {contacts.map((contact, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{contact.title}</h3>
                <div className="flex items-center gap-2">
                  {contact.type === 'emergency' && (
                    <Badge variant="destructive">EMERGENCY</Badge>
                  )}
                  {contact.availability === '24/7' && (
                    <Badge variant="secondary">24/7</Badge>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">{contact.description}</p>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>{contact.availability}</span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={contact.type === 'emergency' ? 'destructive' : 'default'}
                  onClick={() => handleCall(contact.number)}
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {contact.number}
                </Button>
                
                {contact.email && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEmail(contact.email)}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resources & Documentation</CardTitle>
          <CardDescription>Additional security resources and procedures</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resources.map((resource, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{resource.title}</h3>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <p className="text-sm text-muted-foreground">{resource.description}</p>
              
              <Button variant="outline" size="sm" className="w-full">
                Open Resource
              </Button>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Regional Contacts</p>
                <p className="text-blue-700">
                  Contact information is automatically updated based on your selected province. 
                  Local emergency services and regional security teams will be notified as appropriate.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyContacts;
