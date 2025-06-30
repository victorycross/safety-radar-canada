
export interface BulkOperationResult {
  success: boolean;
  processed: number;
  errors: string[];
}

export interface EmployeeCountUpdate {
  hubId: string;
  employeeCount: number;
}
