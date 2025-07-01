
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
}

interface RiskExporterProps {
  risks: SecurityRisk[];
}

const RiskExporter = ({ risks }: RiskExporterProps) => {
  const { toast } = useToast();

  const exportToCSV = () => {
    try {
      const headers = [
        'Threat Category',
        'Likelihood',
        'Impact',
        'Preparedness Gap',
        'RPN',
        'Priority',
        'Last Reviewed',
        'Assigned Lead',
        'Current Alerts',
        'Notes'
      ];

      const csvContent = [
        headers.join(','),
        ...risks.map(risk => [
          `"${risk.threat_category}"`,
          risk.likelihood,
          risk.impact,
          risk.preparedness_gap,
          risk.rpn,
          risk.priority,
          risk.last_reviewed || '',
          `"${risk.assigned_lead || ''}"`,
          `"${(risk.current_alerts || '').replace(/"/g, '""')}"`,
          `"${(risk.notes || '').replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `security-risk-register-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export Successful',
        description: 'Security Risk Register exported to CSV',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export risk register',
        variant: 'destructive',
      });
    }
  };

  const exportToPDF = () => {
    try {
      const currentDate = new Date().toLocaleDateString();
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>National Security Risk Register</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { margin-bottom: 20px; }
            .risk-item { margin-bottom: 30px; page-break-inside: avoid; }
            .risk-header { background: #f5f5f5; padding: 10px; border-left: 4px solid #333; }
            .risk-details { padding: 15px; border: 1px solid #ddd; }
            .priority-high { border-left-color: #dc2626; }
            .priority-medium { border-left-color: #ea580c; }
            .priority-low { border-left-color: #16a34a; }
            .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 10px 0; }
            .metric { text-align: center; padding: 10px; background: #f9f9f9; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .playbook { margin-top: 15px; font-size: 0.9em; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>National Security Risk Register</h1>
            <p>Generated on ${currentDate}</p>
            <p>Total Threats Assessed: ${risks.length}</p>
          </div>
      `;

      // Summary statistics
      const highPriority = risks.filter(r => r.priority === 'high').length;
      const mediumPriority = risks.filter(r => r.priority === 'medium').length;
      const lowPriority = risks.filter(r => r.priority === 'low').length;

      htmlContent += `
        <div class="summary">
          <h2>Executive Summary</h2>
          <table>
            <tr><th>Priority Level</th><th>Count</th><th>Percentage</th></tr>
            <tr><td>High Priority</td><td>${highPriority}</td><td>${((highPriority/risks.length)*100).toFixed(1)}%</td></tr>
            <tr><td>Medium Priority</td><td>${mediumPriority}</td><td>${((mediumPriority/risks.length)*100).toFixed(1)}%</td></tr>
            <tr><td>Low Priority</td><td>${lowPriority}</td><td>${((lowPriority/risks.length)*100).toFixed(1)}%</td></tr>
          </table>
        </div>
      `;

      // Individual risk details
      risks.forEach(risk => {
        htmlContent += `
          <div class="risk-item">
            <div class="risk-header priority-${risk.priority}">
              <h3>${risk.threat_category}</h3>
              <div class="metrics">
                <div class="metric"><strong>L:</strong> ${risk.likelihood}</div>
                <div class="metric"><strong>I:</strong> ${risk.impact}</div>
                <div class="metric"><strong>G:</strong> ${risk.preparedness_gap}</div>
                <div class="metric"><strong>RPN:</strong> ${risk.rpn}</div>
              </div>
            </div>
            <div class="risk-details">
              <p><strong>Priority:</strong> ${risk.priority.toUpperCase()}</p>
              <p><strong>Assigned Lead:</strong> ${risk.assigned_lead || 'Unassigned'}</p>
              <p><strong>Last Reviewed:</strong> ${risk.last_reviewed ? new Date(risk.last_reviewed).toLocaleDateString() : 'Not set'}</p>
              ${risk.current_alerts ? `<p><strong>Current Alerts:</strong> ${risk.current_alerts}</p>` : ''}
              ${risk.notes ? `<p><strong>Notes:</strong> ${risk.notes}</p>` : ''}
              ${risk.playbook && risk.playbook !== 'Playbook in development.' ? 
                `<div class="playbook">
                  <h4>Response Playbook:</h4>
                  <pre>${risk.playbook}</pre>
                </div>` : ''}
            </div>
          </div>
        `;
      });

      htmlContent += `
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `security-risk-register-${new Date().toISOString().split('T')[0]}.html`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: 'Security Risk Register exported as HTML (print to PDF)',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export risk register',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={exportToCSV}>
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
      <Button variant="outline" onClick={exportToPDF}>
        <Download className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
    </div>
  );
};

export default RiskExporter;
