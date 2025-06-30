
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { logger } from './utils/logger';

logger.debug('Main.tsx: Starting application initialization');

const rootElement = document.getElementById("root");
if (!rootElement) {
  logger.error('Main.tsx: Root element not found!');
  throw new Error('Root element not found');
} else {
  logger.debug('Main.tsx: Root element found, creating React root');
  const root = createRoot(rootElement);
  root.render(<App />);
  logger.debug('Main.tsx: App component rendered');
}
