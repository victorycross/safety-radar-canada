
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertLevel } from "@/types";
import { useSupabaseDataContext } from "@/context/SupabaseDataProvider";
import { Skeleton } from "../ui/skeleton";

const EmployeeDistributionChart = () => {
  const { provinces, loading } = useSupabaseDataContext();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employee Distribution</CardTitle>
          <CardDescription>Distribution of employees across Canadian provinces</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  // Filter provinces with employees and sort by count (descending)
  const provincesWithEmployees = provinces
    .filter(p => p.employeeCount > 0)
    .sort((a, b) => b.employeeCount - a.employeeCount);
  
  // Prepare data for the chart
  const chartData = provincesWithEmployees.map(province => ({
    name: province.name,
    employees: province.employeeCount,
    status: province.alertLevel
  }));

  // Calculate total employee count
  const totalEmployees = provinces.reduce((total, province) => total + province.employeeCount, 0);

  // Custom bar fill based on alert level
  const getBarFill = (entry: any) => {
    switch (entry.status) {
      case AlertLevel.SEVERE:
        return "#e11d48";
      case AlertLevel.WARNING:
        return "#f59e0b";
      case AlertLevel.NORMAL:
        return "#10b981";
      default:
        return "#6b7280";
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Distribution</CardTitle>
        <CardDescription>Distribution of {totalEmployees.toLocaleString()} employees across Canadian provinces</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()} employees`, "Count"]}
                labelFormatter={(label: string) => `Province: ${label}`}
              />
              <Bar 
                dataKey="employees" 
                name="Employees" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                fillOpacity={0.9}
                barSize={50}
                stroke="none"
                isAnimationActive={true}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No employee data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeDistributionChart;
