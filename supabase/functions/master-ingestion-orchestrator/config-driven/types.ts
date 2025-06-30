
// Configuration types for config-driven normalization
export interface SourceConfiguration {
  normalization: {
    titleField: string;
    descriptionField: string;
    severityField: string;
    categoryField?: string;
    publishedField: string;
    areaField?: string;
    urgencyField?: string;
    statusField?: string;
    urlField?: string;
    instructionsField?: string;
  };
  fieldMapping?: Record<string, string>;
  transformations?: {
    severityMapping?: Record<string, string>;
    categoryMapping?: Record<string, string>;
  };
}
