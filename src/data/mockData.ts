
import { AlertLevel, Incident, IncidentSource, Province, VerificationStatus } from "@/types";

export const provincesData: Province[] = [
  {
    id: "on",
    name: "Ontario",
    code: "ON",
    alertLevel: AlertLevel.WARNING,
    employeeCount: 2700, // 30% of 9000
    incidents: []
  },
  {
    id: "ab",
    name: "Alberta",
    code: "AB",
    alertLevel: AlertLevel.NORMAL,
    employeeCount: 1800, // 20% of 9000
    incidents: []
  },
  {
    id: "qc",
    name: "Quebec",
    code: "QC",
    alertLevel: AlertLevel.SEVERE,
    employeeCount: 1800, // 20% of 9000
    incidents: []
  },
  {
    id: "bc",
    name: "British Columbia",
    code: "BC",
    alertLevel: AlertLevel.NORMAL,
    employeeCount: 1800, // 20% of 9000
    incidents: []
  },
  {
    id: "ns",
    name: "Nova Scotia",
    code: "NS",
    alertLevel: AlertLevel.NORMAL,
    employeeCount: 450, // 5% of 9000
    incidents: []
  },
  {
    id: "mb",
    name: "Manitoba",
    code: "MB",
    alertLevel: AlertLevel.NORMAL,
    employeeCount: 450, // 5% of 9000
    incidents: []
  },
  {
    id: "sk",
    name: "Saskatchewan",
    code: "SK",
    alertLevel: AlertLevel.NORMAL,
    employeeCount: 0,
    incidents: []
  },
  {
    id: "nb",
    name: "New Brunswick",
    code: "NB",
    alertLevel: AlertLevel.NORMAL,
    employeeCount: 0,
    incidents: []
  },
  {
    id: "nl",
    name: "Newfoundland and Labrador",
    code: "NL",
    alertLevel: AlertLevel.NORMAL,
    employeeCount: 0,
    incidents: []
  },
  {
    id: "pe",
    name: "Prince Edward Island",
    code: "PE",
    alertLevel: AlertLevel.NORMAL,
    employeeCount: 0,
    incidents: []
  },
  {
    id: "nt",
    name: "Northwest Territories",
    code: "NT",
    alertLevel: AlertLevel.NORMAL,
    employeeCount: 0,
    incidents: []
  },
  {
    id: "yt",
    name: "Yukon",
    code: "YT",
    alertLevel: AlertLevel.NORMAL,
    employeeCount: 0,
    incidents: []
  },
  {
    id: "nu",
    name: "Nunavut",
    code: "NU",
    alertLevel: AlertLevel.NORMAL,
    employeeCount: 0,
    incidents: []
  }
];

export const incidentsData: Incident[] = [
  {
    id: "1",
    title: "Protest in Downtown Toronto",
    description: "Large scale protest near financial district. Avoid Bay Street between King and Queen.",
    provinceId: "on",
    timestamp: new Date(2025, 3, 25, 14, 30),
    alertLevel: AlertLevel.WARNING,
    source: IncidentSource.POLICE,
    verificationStatus: VerificationStatus.VERIFIED,
    recommendedAction: "Work from home advised for downtown office employees."
  },
  {
    id: "2",
    title: "Major Snowstorm",
    description: "Severe snowstorm expected to bring 30cm of snow to Montreal area.",
    provinceId: "qc",
    timestamp: new Date(2025, 3, 26, 8, 0),
    alertLevel: AlertLevel.SEVERE,
    source: IncidentSource.GLOBAL_SECURITY,
    verificationStatus: VerificationStatus.VERIFIED,
    recommendedAction: "Remote work day for all Montreal employees."
  },
  {
    id: "3",
    title: "Gas Leak",
    description: "Potential gas leak reported near Calgary office.",
    provinceId: "ab",
    timestamp: new Date(2025, 3, 27, 10, 15),
    alertLevel: AlertLevel.WARNING,
    source: IncidentSource.EMPLOYEE,
    verificationStatus: VerificationStatus.UNVERIFIED,
    recommendedAction: "Await verification before action."
  },
  {
    id: "4",
    title: "Flooding on Highway 401",
    description: "Heavy rains have caused flooding on sections of Highway 401.",
    provinceId: "on",
    timestamp: new Date(2025, 3, 24, 17, 45),
    alertLevel: AlertLevel.WARNING,
    source: IncidentSource.NEWS,
    verificationStatus: VerificationStatus.VERIFIED,
    recommendedAction: "Use alternate routes for commuting."
  },
  {
    id: "5",
    title: "Power Outage",
    description: "Widespread power outage in downtown Montreal affecting office buildings.",
    provinceId: "qc",
    timestamp: new Date(2025, 3, 25, 9, 0),
    alertLevel: AlertLevel.SEVERE,
    source: IncidentSource.EVERBRIDGE,
    verificationStatus: VerificationStatus.VERIFIED,
    recommendedAction: "Work from home until further notice."
  }
];
