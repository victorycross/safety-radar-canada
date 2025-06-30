
import { useToast } from '@/hooks/use-toast';
import { InternationalHub } from '@/types/dashboard';
import { logger } from '@/utils/logger';

export const useHubDataExport = () => {
  const { toast } = useToast();

  const exportHubData = async (hubs: InternationalHub[], format: 'csv' | 'json' = 'csv') => {
    try {
      logger.debug('Exporting hub data', { count: hubs.length, format });

      let content: string;
      let mimeType: string;
      let filename: string;

      if (format === 'csv') {
        content = [
          'ID,Name,Country,Code,Alert Level,Employee Count,Travel Warnings,Local Incidents,Active Status,Created,Updated',
          ...hubs.map(h => [
            h.id,
            `"${h.name}"`,
            `"${h.country}"`,
            h.code,
            h.alertLevel,
            h.employeeCount,
            h.travelWarnings,
            h.localIncidents,
            h.isActive,
            h.created_at || '',
            h.updated_at || ''
          ].join(','))
        ].join('\n');
        mimeType = 'text/csv';
        filename = `hub_export_${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        content = JSON.stringify(hubs, null, 2);
        mimeType = 'application/json';
        filename = `hub_export_${new Date().toISOString().split('T')[0]}.json`;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Complete',
        description: `Exported ${hubs.length} hubs to ${format.toUpperCase()}`,
      });

      logger.info('Hub data exported successfully', { count: hubs.length, format, filename });
    } catch (error) {
      logger.error('Hub data export failed', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export hub data',
        variant: 'destructive',
      });
    }
  };

  return {
    exportHubData
  };
};
