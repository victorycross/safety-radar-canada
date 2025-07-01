
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FormData {
  name: string;
  description: string;
  endpoint: string;
  type: string;
}

interface SourceDetailsFormProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
}

const SourceDetailsForm: React.FC<SourceDetailsFormProps> = ({
  formData,
  onFormDataChange
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Source Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Weather Alerts API"
            value={formData.name}
            onChange={(e) => onFormDataChange({
              ...formData,
              name: e.target.value
            })}
          />
        </div>
        
        <div>
          <Label htmlFor="endpoint">Endpoint URL *</Label>
          <Input
            id="endpoint"
            placeholder="https://api.example.com/feed"
            value={formData.endpoint}
            onChange={(e) => onFormDataChange({
              ...formData,
              endpoint: e.target.value
            })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Brief description of what this source provides..."
          value={formData.description}
          onChange={(e) => onFormDataChange({
            ...formData,
            description: e.target.value
          })}
          rows={3}
        />
      </div>
    </div>
  );
};

export default SourceDetailsForm;
