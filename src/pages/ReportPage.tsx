
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Expand, Minimize2, Save, History } from 'lucide-react';
import { useReportState } from '@/hooks/useReportState';
import ReportGuidelines from '@/components/report/ReportGuidelines';
import EnhancedIncidentForm from '@/components/report/EnhancedIncidentForm';
import SubmissionHistory from '@/components/report/SubmissionHistory';
import EmergencyContacts from '@/components/report/EmergencyContacts';

const ReportPage = () => {
  const {
    state,
    updateFormData,
    saveDraft,
    clearDraft,
    addToHistory,
    getOpenSections,
    handleAccordionChange,
    expandAll,
    collapseAll
  } = useReportState();

  const handleFormSubmit = (submissionData: any) => {
    addToHistory({
      ...submissionData,
      referenceId: `REP-${Date.now()}`,
      status: 'submitted',
      lastUpdate: new Date().toISOString(),
      updateMessage: 'Report submitted successfully'
    });
    clearDraft();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Report an Incident</h1>
          <p className="text-muted-foreground">Submit information about security concerns in your area</p>
        </div>
        
        <div className="flex items-center gap-2">
          {state.isDraft && (
            <Badge variant="secondary" className="mr-2">
              <Save className="h-3 w-3 mr-1" />
              Draft Saved
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={expandAll}>
            <Expand className="h-4 w-4 mr-2" />
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            <Minimize2 className="h-4 w-4 mr-2" />
            Collapse All
          </Button>
        </div>
      </div>

      <Accordion 
        type="multiple" 
        value={getOpenSections()} 
        onValueChange={handleAccordionChange}
        className="space-y-4"
      >
        {/* Guidelines Section */}
        <AccordionItem value="guidelines" className="border rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              Reporting Guidelines & Safety
              <Badge variant="outline">Important</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <ReportGuidelines />
          </AccordionContent>
        </AccordionItem>

        {/* Report Form Section */}
        <AccordionItem value="report-form" className="border rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              Incident Report Form
              {state.isDraft && <Badge variant="secondary">Draft in Progress</Badge>}
              {Object.keys(state.formData).length > 0 && !state.isDraft && (
                <Badge variant="outline">Form Data Available</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <EnhancedIncidentForm
              formData={state.formData}
              onFormDataChange={updateFormData}
              onSaveDraft={saveDraft}
              onSubmit={handleFormSubmit}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Submission History Section */}
        <AccordionItem value="submission-history" className="border rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Submission History
              {state.submitHistory.length > 0 && (
                <Badge variant="outline">{state.submitHistory.length}</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <SubmissionHistory submissions={state.submitHistory} />
          </AccordionContent>
        </AccordionItem>

        {/* Emergency Contacts Section */}
        <AccordionItem value="emergency-contacts" className="border rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold">
            Emergency Contacts & Resources
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <EmergencyContacts />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ReportPage;
