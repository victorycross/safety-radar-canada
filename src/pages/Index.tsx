
import React from 'react';
import HomePage from './HomePage';
import { logger } from '@/utils/logger';

const Index = () => {
  logger.debug('Index: Component rendering');
  
  return <HomePage />;
};

export default Index;
