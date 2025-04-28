
import React from 'react';
import IncidentForm from '@/components/forms/IncidentForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Check } from 'lucide-react';

const ReportPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Report an Incident</h1>
        <p className="text-muted-foreground">Submit information about security concerns in your area</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2">
          <IncidentForm />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reporting Guidelines</CardTitle>
              <CardDescription>Important information about reporting incidents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Be specific and accurate</p>
                  <p className="text-muted-foreground">Provide as much detail as possible about the incident, including exact location and time.</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Don't put yourself at risk</p>
                  <p className="text-muted-foreground">Never place yourself in danger to gather information or photos of an incident.</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Follow emergency procedures</p>
                  <p className="text-muted-foreground">For immediate threats, always contact local emergency services first.</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">All reports are reviewed</p>
                  <p className="text-muted-foreground">Your submission will be reviewed by security personnel before being published.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-medium">Emergency Services</div>
                <div className="text-sm text-muted-foreground">911</div>
              </div>
              
              <div>
                <div className="font-medium">Global Security Operations</div>
                <div className="text-sm text-muted-foreground">+1 (555) 123-4567</div>
              </div>
              
              <div>
                <div className="font-medium">24/7 Security Hotline</div>
                <div className="text-sm text-muted-foreground">security@company.com</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
