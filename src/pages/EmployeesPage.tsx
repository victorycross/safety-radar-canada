
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSecurity } from "@/context/SecurityContext";
import EmployeeDistributionChart from "@/components/dashboard/EmployeeDistributionChart";
import { AlertLevel } from "@/types";
import { Badge } from "@/components/ui/badge";

const EmployeesPage = () => {
  const { provinces } = useSecurity();

  // Get total employee count
  const totalEmployees = provinces.reduce((acc, province) => acc + province.employeeCount, 0);
  
  // Count employees by risk level
  const employeesAtRisk = provinces
    .filter(province => province.alertLevel === AlertLevel.SEVERE || province.alertLevel === AlertLevel.WARNING)
    .reduce((acc, province) => acc + province.employeeCount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Employee Distribution</h1>
        <p className="text-muted-foreground">Geographic distribution of employees across Canadian provinces</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Employees</CardTitle>
            <CardDescription>Entire Canadian workforce</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEmployees.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Employees at Risk</CardTitle>
            <CardDescription>In warning or severe areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{employeesAtRisk.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {((employeesAtRisk / totalEmployees) * 100).toFixed(1)}% of total workforce
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Distribution</CardTitle>
            <CardDescription>Top provinces by headcount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {provinces
                .filter(p => p.employeeCount > 0)
                .sort((a, b) => b.employeeCount - a.employeeCount)
                .slice(0, 3)
                .map(province => (
                  <div key={province.id} className="flex justify-between items-center">
                    <div>{province.name}</div>
                    <div className="flex items-center">
                      <span className="mr-2">{province.employeeCount.toLocaleString()}</span>
                      {province.alertLevel !== AlertLevel.NORMAL && (
                        <Badge 
                          className={`${province.alertLevel === AlertLevel.SEVERE ? 'bg-danger' : 'bg-warning'}`}
                        >
                          {province.alertLevel}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      </div>
      
      <EmployeeDistributionChart />
      
      <Card>
        <CardHeader>
          <CardTitle>Employee Distribution Breakdown</CardTitle>
          <CardDescription>Complete breakdown by province</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50">
                <tr>
                  <th scope="col" className="px-6 py-3">Province</th>
                  <th scope="col" className="px-6 py-3">Employee Count</th>
                  <th scope="col" className="px-6 py-3">Percentage</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {provinces
                  .filter(p => p.employeeCount > 0)
                  .sort((a, b) => b.employeeCount - a.employeeCount)
                  .map(province => (
                    <tr key={province.id} className="border-b">
                      <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap">
                        {province.name}
                      </th>
                      <td className="px-6 py-4">{province.employeeCount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {((province.employeeCount / totalEmployees) * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4">
                        {province.alertLevel === AlertLevel.SEVERE && (
                          <Badge className="bg-danger">Severe</Badge>
                        )}
                        {province.alertLevel === AlertLevel.WARNING && (
                          <Badge className="bg-warning">Warning</Badge>
                        )}
                        {province.alertLevel === AlertLevel.NORMAL && (
                          <Badge className="bg-success">Normal</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeesPage;
