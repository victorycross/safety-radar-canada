
// Types for the CKAN API
export interface Dataset {
  id: string;
  name: string;
  title: string;
  notes?: string;
  license_title?: string;
  organization?: {
    name: string;
    title: string;
    id: string;
  };
  resources?: Resource[];
  metadata_created?: string;
  metadata_modified?: string;
  tags?: { name: string }[];
}

export interface Resource {
  id: string;
  name: string;
  description?: string;
  format?: string;
  url?: string;
  created?: string;
  last_modified?: string;
  size?: number;
}

export interface DatasetDetail extends Dataset {
  extras?: { key: string; value: string }[];
  state?: string;
  version?: string;
  groups?: { name: string; title: string }[];
}

// Base URL for the Open Government CKAN API
const CKAN_API_URL = "https://open.canada.ca/data/api/3/action";

/**
 * Fetch datasets from the Open Government CKAN API
 */
export const fetchDatasets = async (query: string = "", limit: number = 24): Promise<Dataset[]> => {
  try {
    const params = new URLSearchParams({
      q: query,
      rows: limit.toString(),
    });
    
    const response = await fetch(`${CKAN_API_URL}/package_search?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();
    return data.result.results;
  } catch (error) {
    console.error("Error fetching datasets:", error);
    throw error;
  }
};

/**
 * Fetch details for a specific dataset
 */
export const fetchDatasetDetails = async (datasetId: string): Promise<DatasetDetail> => {
  try {
    const response = await fetch(`${CKAN_API_URL}/package_show?id=${datasetId}`);
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error fetching dataset details:", error);
    throw error;
  }
};

/**
 * Fetch resources for a dataset
 */
export const fetchDatasetResources = async (datasetId: string): Promise<Resource[]> => {
  try {
    const response = await fetch(`${CKAN_API_URL}/package_show?id=${datasetId}`);
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();
    return data.result.resources || [];
  } catch (error) {
    console.error("Error fetching dataset resources:", error);
    throw error;
  }
};

/**
 * Fetch organizations from the Open Government CKAN API
 */
export const fetchOrganizations = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${CKAN_API_URL}/organization_list?all_fields=true`);
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error fetching organizations:", error);
    throw error;
  }
};
