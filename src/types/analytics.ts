
export interface AnalyticsFilter {
  dateRange: {
    from: Date;
    to: Date;
  };
  alertLevels: string[];
  provinces: string[];
  sources: string[];
  refreshInterval: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}

export interface AnalyticsChartData {
  incidentsByAlertLevel: ChartDataPoint[];
  incidentsBySource: ChartDataPoint[];
  provincesByAlertLevel: ChartDataPoint[];
  trendsOverTime: {
    date: string;
    incidents: number;
    alerts: number;
  }[];
}
