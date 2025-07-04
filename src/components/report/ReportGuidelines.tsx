
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Check, Phone, Shield, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const ReportGuidelines = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0">
            <CardHeader className="flex-row items-center justify-between w-full p-6">
              <div>
                <CardTitle className="flex items-center gap-2 text-left">
                  <Check className="h-5 w-5 text-green-600" />
                  Reporting Guidelines
                </CardTitle>
                <CardDescription className="text-left">
                  Important information for effective incident reporting
                </CardDescription>
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardHeader>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Reporting Best Practices
          </CardTitle>
          <CardDescription>Follow these guidelines for effective incident reporting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-3">
            <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Be specific and accurate</p>
              <p className="text-muted-foreground">Include exact location, time, and detailed description of what occurred.</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Report immediately</p>
              <p className="text-muted-foreground">Submit reports as soon as possible while details are fresh.</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Include evidence</p>
              <p className="text-muted-foreground">Attach photos, documents, or other relevant evidence if safe to do so.</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Provide contact information</p>
              <p className="text-muted-foreground">Include your contact details for follow-up questions.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Safety First
          </CardTitle>
          <CardDescription>Your safety is our top priority</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Never put yourself at risk</strong> to gather information or evidence. Your safety comes first.
            </AlertDescription>
          </Alert>
          
          <div className="flex space-x-3">
            <Phone className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Emergency situations</p>
              <p className="text-muted-foreground">For immediate threats, always call 911 or local emergency services first.</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Clock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Ongoing incidents</p>
              <p className="text-muted-foreground">If a situation is still developing, prioritize your safety and evacuation.</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <MapPin className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Secure location</p>
              <p className="text-muted-foreground">Only report from a safe location away from any ongoing threat.</p>
            </div>
          </div>
        </CardContent>
      </Card>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default ReportGuidelines;
