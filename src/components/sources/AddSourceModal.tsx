
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SourceTypeSelector from './add-source-modal/SourceTypeSelector';
import SourceDetailsForm from './add-source-modal/SourceDetailsForm';
import { useAddSourceLogic } from './add-source-modal/useAddSourceLogic';

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (sourceData: any) => void;
}

const AddSourceModal: React.FC<AddSourceModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const {
    selectedType,
    formData,
    handleTypeSelect,
    setFormData,
    handleAdd,
    resetForm
  } = useAddSourceLogic(onAdd, onClose);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Data Source</DialogTitle>
          <DialogDescription>
            Choose a source type and configure the connection details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <SourceTypeSelector
            selectedType={selectedType}
            onTypeSelect={handleTypeSelect}
          />

          {selectedType && (
            <SourceDetailsForm
              formData={formData}
              onFormDataChange={setFormData}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAdd} 
            disabled={!selectedType || !formData.name || !formData.endpoint}
          >
            Add Source
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSourceModal;
