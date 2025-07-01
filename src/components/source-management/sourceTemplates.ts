
import { 
  Database, 
  Globe, 
  Rss, 
  Shield, 
  Cloud, 
  Zap
} from 'lucide-react';

export interface SourceTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  defaultConfig: {
    source_type: string;
    polling_interval: number;
    configuration: any;
  };
}

export const SOURCE_TEMPLATES: SourceTemplate[] = [
  {
    id: 'rss',
    name: 'RSS Feed',
    description: 'RSS or Atom feed source',
    icon: Rss,
    defaultConfig: {
      source_type: 'rss',
      polling_interval: 1800,
      configuration: { format: 'rss', parser: 'xml' }
    }
  },
  {
    id: 'security-rss',
    name: 'Security RSS Feed',
    description: 'Security alerts via RSS',
    icon: Shield,
    defaultConfig: {
      source_type: 'security-rss',
      polling_interval: 300,
      configuration: { format: 'rss', parser: 'xml', category: 'security' }
    }
  },
  {
    id: 'weather',
    name: 'Weather API',
    description: 'Weather alerts and data',
    icon: Cloud,
    defaultConfig: {
      source_type: 'weather',
      polling_interval: 600,
      configuration: { format: 'json', parser: 'weather' }
    }
  },
  {
    id: 'immigration-travel-atom',
    name: 'Immigration & Travel',
    description: 'Government announcements',
    icon: Globe,
    defaultConfig: {
      source_type: 'immigration-travel-atom',
      polling_interval: 3600,
      configuration: { format: 'atom', parser: 'government' }
    }
  },
  {
    id: 'api',
    name: 'REST API',
    description: 'Generic REST API endpoint',
    icon: Globe,
    defaultConfig: {
      source_type: 'api',
      polling_interval: 300,
      configuration: { format: 'json', method: 'GET' }
    }
  },
  {
    id: 'webhook',
    name: 'Webhook',
    description: 'Incoming webhook receiver',
    icon: Zap,
    defaultConfig: {
      source_type: 'webhook',
      polling_interval: 0,
      configuration: { format: 'json', method: 'POST' }
    }
  }
];
