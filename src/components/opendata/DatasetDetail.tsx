
import React from "react";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { X, Download, ExternalLink, Clock, Calendar, Tag, FileIcon } from "lucide-react";
import { Dataset, DatasetDetail as DatasetDetailType } from "@/services/openDataService";
import { format } from "date-fns";

interface DatasetDetailProps {
  dataset: Dataset;
  details: DatasetDetailType | null | undefined;
  isLoading: boolean;
  onClose: () => void;
}

const DatasetDetail: React.FC<DatasetDetailProps> = ({ 
  dataset, 
  details, 
  isLoading, 
  onClose 
}) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return "Unknown";
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };

  return (
    <Sheet open={!!dataset} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full md:max-w-[800px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex justify-between items-start">
            <SheetTitle className="pr-8">{dataset.title}</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          <SheetDescription>
            <div className="flex items-center text-sm gap-4 mt-1">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Created: {formatDate(dataset.metadata_created)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>Updated: {formatDate(dataset.metadata_modified)}</span>
              </div>
            </div>
          </SheetDescription>
        </SheetHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p>Loading dataset details...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {details?.notes || dataset.notes || "No description available."}
              </p>
            </div>
            
            {dataset.organization && (
              <div>
                <h3 className="text-lg font-medium mb-2">Organization</h3>
                <p className="text-sm">{dataset.organization.title}</p>
              </div>
            )}
            
            {(dataset.tags?.length || 0) > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {dataset.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {(details?.resources?.length || 0) > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Resources</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Last Modified</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {details?.resources?.map((resource) => (
                        <TableRow key={resource.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <FileIcon className="h-4 w-4 mr-2" />
                              {resource.name || "Unnamed resource"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {resource.format && (
                              <Badge variant="outline">{resource.format}</Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatFileSize(resource.size)}</TableCell>
                          <TableCell>{formatDate(resource.last_modified)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-end">
                              {resource.url && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                  >
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                  >
                                    <a href={resource.url} download>
                                      <Download className="h-4 w-4" />
                                    </a>
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            {(details?.extras?.length || 0) > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Additional Information</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Field</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {details?.extras?.map((extra, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{extra.key}</TableCell>
                          <TableCell>{extra.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            {dataset.license_title && (
              <div>
                <h3 className="text-lg font-medium mb-2">License</h3>
                <p className="text-sm">{dataset.license_title}</p>
              </div>
            )}
            
            <div className="pt-4">
              <Button asChild>
                <a 
                  href={`https://open.canada.ca/data/en/dataset/${dataset.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Open Canada Portal
                </a>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default DatasetDetail;
