
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, Activity, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface TimeSeriesData {
  date: string;
  incidents: number;
  severe: number;
  warning: number;
  normal: number;
}

interface EnhancedChartsProps {
  incidentsByAlertLevel: ChartData[];
  incidentsBySource: ChartData[];
  provincesByAlertLevel: ChartData[];
  timeSeriesData?: TimeSeriesData[];
}

const EnhancedCharts: React.FC<EnhancedChartsProps> = ({
  incidentsByAlertLevel,
  incidentsBySource,
  provincesByAlertLevel,
  timeSeriesData
}) => {
  const mockTimeSeriesData: TimeSeriesData[] = timeSeriesData || [
    { date: '2024-01-01', incidents: 12, severe: 2, warning: 5, normal: 5 },
    { date: '2024-01-02', incidents: 8, severe: 1, warning: 3, normal: 4 },
    { date: '2024-01-03', incidents: 15, severe: 4, warning: 6, normal: 5 },
    { date: '2024-01-04', incidents: 6, severe: 0, warning: 2, normal: 4 },
    { date: '2024-01-05', incidents: 11, severe: 2, warning: 4, normal: 5 },
    { date: '2024-01-06', incidents: 9, severe: 1, warning: 3, normal: 5 },
    { date: '2024-01-07', incidents: 13, severe: 3, warning: 5, normal: 5 }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded p-2 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Time Series Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Incident Trends (7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockTimeSeriesData}>
              <defs>
                <linearGradient id="colorSevere" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="severe"
                stackId="1"
                stroke="#e11d48"
                fill="url(#colorSevere)"
                name="Severe"
              />
              <Area
                type="monotone"
                dataKey="warning"
                stackId="1"
                stroke="#f59e0b"
                fill="url(#colorWarning)"
                name="Warning"
              />
              <Area
                type="monotone"
                dataKey="normal"
                stackId="1"
                stroke="#10b981"
                fill="url(#colorNormal)"
                name="Normal"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Incident Distribution by Alert Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5" />
              Incidents by Severity
            </CardTitle>
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
                  innerRadius={30}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {incidentsByAlertLevel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Source Performance Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Source Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentsBySource.filter(d => d.value > 0)} layout="horizontal">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {incidentsBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 40}, 70%, 60%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Provincial Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Provincial Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={provincesByAlertLevel}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {provincesByAlertLevel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCharts;
