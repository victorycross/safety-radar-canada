
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home, Globe } from 'lucide-react';

interface HubBreadcrumbProps {
  hubName?: string;
  hubId?: string;
}

const HubBreadcrumb: React.FC<HubBreadcrumbProps> = ({ hubName, hubId }) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center space-x-1">
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/hubs" className="flex items-center space-x-1">
              <Globe className="h-4 w-4" />
              <span>International Hubs</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {hubName && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{hubName}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default HubBreadcrumb;
