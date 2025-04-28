
import React from "react";
import { useSecurity } from "@/context/SecurityContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertLevel } from "@/types";

const EmployeeDistributionChart = () => {
  const { provinces } = useSecurity();

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
        <CardDescription>Distribution of 9,000 employees across Canadian provinces</CardDescription>
      </CardHeader>
      <CardContent>
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
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default EmployeeDistributionChart;
