
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileIcon, LinkIcon, CalendarIcon } from "lucide-react";
import { Dataset } from "@/services/openDataService";

interface DatasetCardProps {
  dataset: Dataset;
  onClick: () => void;
}

const DatasetCard: React.FC<DatasetCardProps> = ({ dataset, onClick }) => {
  const resourceCount = dataset.resources?.length || 0;
  const resourceFormats = dataset.resources?.map(r => r.format).filter(Boolean) || [];
  const uniqueFormats = [...new Set(resourceFormats)];
  
  // Truncate long descriptions
  const truncateDescription = (text: string | undefined, maxLength: number = 100) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">{dataset.title}</CardTitle>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <CalendarIcon className="h-3 w-3 mr-1" />
          <span>Updated: {new Date(dataset.metadata_modified || "").toLocaleDateString()}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {truncateDescription(dataset.notes)}
        </p>
        
        <div className="mt-4">
          {dataset.organization && (
            <div className="flex items-center text-sm mb-2">
              <LinkIcon className="h-3 w-3 mr-1" />
              <span>{dataset.organization.title}</span>
            </div>
          )}
          
          {resourceCount > 0 && (
            <div className="flex items-center text-sm">
              <FileIcon className="h-3 w-3 mr-1" />
              <span>{resourceCount} resources</span>
            </div>
          )}
        </div>
        
        {uniqueFormats.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {uniqueFormats.slice(0, 4).map((format, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {format}
              </Badge>
            ))}
            {uniqueFormats.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{uniqueFormats.length - 4} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" className="w-full" onClick={onClick}>View Details</Button>
      </CardFooter>
    </Card>
  );
};

export default DatasetCard;
