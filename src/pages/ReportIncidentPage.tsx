
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EnhancedIncidentForm from '@/components/report/EnhancedIncidentForm';
import ReportGuidelines from '@/components/report/ReportGuidelines';
import EmergencyContacts from '@/components/report/EmergencyContacts';
import { AlertTriangle, FileText, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ReportIncidentPage = () => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const handleFormDataChange = (data: Record<string, any>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSaveDraft = () => {
    // Save form data to localStorage or send to backend
    localStorage.setItem('incident_draft', JSON.stringify(formData));
    toast({
      title: "Draft Saved",
      description: "Your incident report draft has been saved locally.",
    });
  };

  const handleSubmit = (data: any) => {
    // Handle form submission
    console.log('Incident report submitted:', data);
    // Clear form after successful submission
    setFormData({});
    // Remove draft from localStorage
    localStorage.removeItem('incident_draft');
  };

  // Load draft on component mount
  React.useEffect(() => {
    const savedDraft = localStorage.getItem('incident_draft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setFormData(parsedDraft);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Report Incident</h1>
        <p className="text-muted-foreground">
          Report security incidents, safety concerns, or emergency situations
        </p>
      </div>

      {/* Emergency Notice */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Emergency Situations
          </CardTitle>
          <CardDescription className="text-red-600">
            For immediate emergencies requiring urgent response, contact emergency services directly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-700 font-semibold">
            <Phone className="h-4 w-4" />
            Emergency: 911 | Security Hotline: 1-800-SECURITY
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Incident Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Incident Report Form
              </CardTitle>
              <CardDescription>
                Provide detailed information about the incident
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedIncidentForm
                formData={formData}
                onFormDataChange={handleFormDataChange}
                onSaveDraft={handleSaveDraft}
                onSubmit={handleSubmit}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with Guidelines and Contacts */}
        <div className="space-y-6">
          <ReportGuidelines />
          <EmergencyContacts />
        </div>
      </div>
    </div>
  );
};

export default ReportIncidentPage;
