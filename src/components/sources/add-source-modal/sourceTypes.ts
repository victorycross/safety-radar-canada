
import { Database, Globe, Rss, Shield, TrendingUp, Zap } from "lucide-react";

export const SOURCE_TYPES = [
  {
    id: 'api',
    name: 'API Endpoint',
    description: 'REST API or webhook endpoint',
    icon: Globe,
    defaultConfig: {
      method: 'GET',
      pollInterval: 300,
      timeout: 30
    }
  },
  {
    id: 'database',
    name: 'Database',
    description: 'SQL database connection',
    icon: Database,
    defaultConfig: {
      pollInterval: 600,
      timeout: 60
    }
  },
  {
    id: 'rss',
    name: 'RSS/Atom Feed',
    description: 'RSS or Atom feed source',
    icon: Rss,
    defaultConfig: {
      pollInterval: 1800,
      timeout: 30
    }
  },
  {
    id: 'security',
    name: 'Security Feed',
    description: 'Security alerts and threats',
    icon: Shield,
    defaultConfig: {
      pollInterval: 300,
      timeout: 30
    }
  },
  {
    id: 'monitoring',
    name: 'Monitoring System',
    description: 'System monitoring and metrics',
    icon: TrendingUp,
    defaultConfig: {
      pollInterval: 60,
      timeout: 15
    }
  },
  {
    id: 'webhook',
    name: 'Webhook',
    description: 'Incoming webhook receiver',
    icon: Zap,
    defaultConfig: {
      pollInterval: 0,
      timeout: 30
    }
  }
];
